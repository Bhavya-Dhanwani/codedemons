// License signing, payments, client mails and reminders for the CRM
import crypto from "node:crypto";
import env from "../config/env.config.js";
import logger from "../config/logger.config.js";
import sendMail from "./sendMail.util.js";
import Client from "../models/client.model.js";
import Invoice from "../models/invoice.model.js";
import Doc from "../models/doc.model.js";
import { shell, button, esc, site } from "../../modules/public/contact/contact.mail.js";

const DAY = 864e5;

// ---------- license leases ----------
// Ed25519 key derived from a secret, so nothing has to be stored; websites only ever get the public half
const seed = crypto.createHash("sha256").update(env.LICENSE_SECRET || `${env.ACCESS_TOKEN_SECRET}:license`).digest();
const privateKey = crypto.createPrivateKey({ key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]), format: "der", type: "pkcs8" });
export const publicKey = crypto.createPublicKey(privateKey).export({ format: "jwk" }).x as string;

type License = { key?: string | null; on?: boolean | null; paidUntil?: Date | null; graceDays?: number | null };

// none | off (switched off) | expired (grace over) | grace (unpaid, still running) | active
export function licenseState(l: License | null | undefined, now = Date.now()) {
    if (!l?.key) return "none";
    if (!l.on) return "off";
    if (!l.paidUntil) return "active";
    const paid = l.paidUntil.getTime();
    if (now <= paid) return "active";
    return now <= paid + (l.graceDays ?? 7) * DAY ? "grace" : "expired";
}

// signed "payload.signature"; a running site trusts it for up to 7 days without calling us
type Page = { heading?: string | null; logo?: string | null; bg?: string | null; fg?: string | null; accent?: string | null; buttonLabel?: string | null; buttonUrl?: string | null };

export function lease(l: License & { domain?: string | null; message?: string | null; page?: Page | null }, now = Date.now()) {
    const state = licenseState(l, now);
    const on = state === "active" || state === "grace";
    const graceEnd = l.paidUntil ? l.paidUntil.getTime() + (l.graceDays ?? 7) * DAY : Infinity;
    const g = l.page ?? {};
    // the maintenance page design rides along only while the site is down, so "on" leases stay tiny
    const p = on ? undefined : { h: g.heading || "", l: g.logo || "", bg: g.bg || "", fg: g.fg || "", ac: g.accent || "", bl: g.buttonLabel || "", bu: g.buttonUrl || "" };
    const payload = { k: l.key, d: l.domain || "", s: on ? "on" : "off", m: on ? "" : l.message || "", p, iat: now, exp: Math.min(now + 7 * DAY, on ? graceEnd : Infinity) };
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${body}.${crypto.sign(null, Buffer.from(body), privateKey).toString("base64url")}`;
}

export const newLicenseKey = () => "LIC-" + crypto.randomBytes(9).toString("base64url").toUpperCase().replace(/[-_]/g, "X");

// ---------- payments ----------
export const razorpayOn = () => !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

async function razorpay(path: string, init: RequestInit = {}) {
    const res = await fetch("https://api.razorpay.com/v1" + path, {
        ...init,
        headers: { "content-type": "application/json", authorization: "Basic " + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64") },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.description || `Razorpay error ${res.status}`);
    return json;
}

type InvoiceDoc = InstanceType<typeof Invoice>;

// a Razorpay payment link (UPI, cards, netbanking) for this invoice, created once
export async function paymentLink(inv: InvoiceDoc, client: { name: string; email: string }) {
    if (inv.link?.url) return inv.link.url;
    const link = await razorpay("/payment_links", {
        method: "POST",
        body: JSON.stringify({
            amount: Math.round(inv.amount * 100), currency: "INR", description: inv.title.slice(0, 200), reference_id: inv.number,
            customer: { name: client.name, email: client.email || undefined },
            notify: { sms: false, email: false }, reminder_enable: false,
            callback_url: `${site}/portal?paid=${inv._id}`, callback_method: "get",
        }),
    });
    inv.link = { id: link.id, url: link.short_url };
    await inv.save();
    return link.short_url as string;
}

// the auto-detect: asks Razorpay whether the link was paid
export async function syncInvoice(inv: InvoiceDoc) {
    if (inv.status === "paid" || !inv.link?.id || !razorpayOn()) return inv;
    try {
        const link = await razorpay(`/payment_links/${inv.link.id}`);
        if (link.status === "paid") await markPaid(inv, link.payments?.[0]?.payment_id || "razorpay");
    } catch (err) { logger.warn({ err, invoice: inv.number }, "Razorpay sync failed"); }
    return inv;
}

export async function markPaid(inv: InvoiceDoc, ref = "") {
    if (inv.status === "paid") return;
    inv.status = "paid";
    inv.paidAt = new Date();
    if (ref) inv.utr = ref;
    await inv.save();
    // inv.client may be populated (reminder run) or a bare id
    const client = await Client.findById((inv.client as { _id?: unknown })?._id ?? inv.client);
    if (!client) return;
    if (inv.licenseDays > 0 && client.license?.key) {
        const from = Math.max(Date.now(), client.license.paidUntil?.getTime() ?? 0);
        client.license.paidUntil = new Date(from + inv.licenseDays * DAY);
        await client.save();
    }
    if (client.email) void sendMail(client.email, `Payment received: ${inv.title}`, clientMail(client.name, "Payment received", "Thank you.", `We received <b>₹${inv.amount.toLocaleString("en-IN")}</b> for ${esc(inv.title)} (${inv.number}).`, "View in your portal"));
}

export const upiLink = (inv: { amount: number; number: string }) =>
    env.UPI_ID ? `upi://pay?${new URLSearchParams({ pa: env.UPI_ID, pn: env.UPI_NAME, am: inv.amount.toFixed(2), cu: "INR", tn: inv.number, tr: inv.number })}` : "";

// ---------- mails ----------
export function clientMail(name: string, tag: string, accent: string, body: string, cta = "Open your portal", href = `${site}/portal`) {
    const first = esc(name.split(/\s+/)[0] || "there");
    return shell(tag, tag, `Hi ${first},`, accent, `<p style="margin:0 0 28px;">${body}</p>${button(href, `${cta} &rarr;`)}
        <p style="margin:32px 0 0;color:#6e6d73;">Bhavya &amp; Sameer, codedemons</p>`);
}

// ---------- reminders ----------
// ponytail: runs inside the web process; with several instances each would send, move to one cron worker then
export async function remind() {
    const now = Date.now();
    const quiet = new Date(now - 3 * DAY); // at most one reminder every 3 days

    const invoices = await Invoice.find({ status: { $ne: "paid" }, dueAt: { $lte: new Date(now + 3 * DAY) }, $or: [{ remindedAt: null }, { remindedAt: { $lt: quiet } }] }).populate<{ client: { name: string; email: string; portal: boolean } }>("client", "name email portal");
    for (const inv of invoices) {
        if (await syncInvoice(inv as unknown as InvoiceDoc).then((i) => i.status === "paid")) continue;
        if (inv.status !== "due" || !inv.client?.email) continue;
        const late = inv.dueAt.getTime() < now;
        const when = inv.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
        await sendMail(inv.client.email, late ? `Payment overdue: ${inv.title}` : `Payment due ${when}: ${inv.title}`,
            clientMail(inv.client.name, "Payment reminder", late ? "This one is overdue." : "A friendly reminder.",
                `<b>₹${inv.amount.toLocaleString("en-IN")}</b> for ${esc(inv.title)} ${late ? "was" : "is"} due on <b>${when}</b>. You can pay by UPI in a few seconds from your portal.`, "Pay now"));
        inv.remindedAt = new Date();
        await inv.save();
    }

    const docs = await Doc.find({ status: "sent", sentAt: { $lt: quiet }, $or: [{ remindedAt: null }, { remindedAt: { $lt: quiet } }] }).populate<{ client: { name: string; email: string } }>("client", "name email");
    for (const doc of docs) {
        if (!doc.client?.email) continue;
        await sendMail(doc.client.email, `Waiting for your signature: ${doc.title}`,
            clientMail(doc.client.name, "Signature needed", "One quick signature.", `<b>${esc(doc.title)}</b> is waiting for your signature. It takes under a minute.`, "Review and sign"));
        doc.remindedAt = new Date();
        await doc.save();
    }
}

export function startReminders() {
    const run = () => remind().catch((err) => logger.error({ err }, "Reminder run failed"));
    setTimeout(run, 60_000);
    setInterval(run, 60 * 60 * 1000);
}
