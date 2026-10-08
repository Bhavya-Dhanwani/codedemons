// Importing modules
import express, { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import z from "zod";
import env from "../../shared/config/env.config.js";
import logger from "../../shared/config/logger.config.js";
import Client from "../../shared/models/client.model.js";
import Invoice from "../../shared/models/invoice.model.js";
import Doc from "../../shared/models/doc.model.js";
import NotFound from "../../shared/errors/NotFound.error.js";
import BadRequest from "../../shared/errors/BadRequest.error.js";
import Unauthorized from "../../shared/errors/Unauthorized.error.js";
import Ok from "../../shared/responses/Ok.response.js";
import sendMail from "../../shared/utils/sendMail.util.js";
import { clientMail, licenseState, paymentLink, razorpayOn, syncInvoice, upiLink } from "../../shared/utils/crm.util.js";
import { parse } from "../admin/admin.controller.js";
import { esc, site } from "../public/contact/contact.mail.js";
import { signSchema } from "../admin/crm.router.js";

// making the router
const router = express.Router();

const hash = (code: string) => crypto.createHmac("sha256", env.ACCESS_TOKEN_SECRET).update(code).digest("hex");
const email = z.string().trim().toLowerCase().email("That email doesn't look right").max(200);

// ponytail: in-memory per-IP limit like the contact form; shared store if we run several instances
const asked = new Map<string, number[]>();
const limit = (ip = "unknown") => {
    const now = Date.now();
    const recent = (asked.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
    if (recent.length >= 5) throw new BadRequest("Too many codes requested. Try again in 15 minutes.");
    asked.set(ip, [...recent, now]);
};

const sendCode = async (client: InstanceType<typeof Client>) => {
    const code = String(crypto.randomInt(100000, 1000000));
    client.login = { code: hash(code), exp: new Date(Date.now() + 10 * 60 * 1000), tries: 0 };
    await client.save();
    if (!env.SEND_MAIL) logger.info(`[Portal] login code for ${client.email}: ${code}`);
    await sendMail(client.email, `${code} is your codedemons login code`, clientMail(client.name, "Login code", "Here's your code.",
        `<span style="font:600 34px/1 monospace;letter-spacing:.3em;">${code}</span><br><br>It works for 10 minutes. If you didn't ask for it, ignore this email.`, "Open the portal"));
};

/*
    @route POST /api/portal/code
    @desc Email a 6 digit login code (same answer whether or not the email exists)
    @access Public (rate limited)
*/
router.post("/code", async (req: Request, res: Response) => {
    const { email: e } = parse(z.object({ email }), req.body);
    limit(req.ip);
    const client = await Client.findOne({ email: e, portal: true });
    if (client) await sendCode(client);
    return Ok(res, "If this email has a portal, a code is on its way", null);
});

// same rules as the signup form (client/src/shared/lib/validators.ts); the server is the one that counts
const line = (max: number, what: string) => z.string().trim().max(max, `${what} is too long`).regex(/^[^\r\n\t]*$/, `${what} must be a single line`);
const digits = (v: string) => v.replace(/\D/g, "").length;
const signupSchema = z.object({
    name: line(100, "Name").min(2, "Please tell us your name").regex(/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u, "Use letters in your name (spaces, . ' - are fine)"),
    email,
    company: line(120, "Company").default(""),
    phone: line(20, "Phone").default("").refine((v) => !v || (/^\+?[\d\s()-]+$/.test(v) && digits(v) >= 7 && digits(v) <= 15), "That phone number doesn't look right"),
    website: z.string().max(200).default(""), // honeypot: hidden from people, bots fill it
});

/*
    @route POST /api/portal/signup
    @desc Self signup: becomes a new lead in the CRM with the portal on, then gets a login code.
          An existing record with that email just gets its portal turned on; only the inbox owner can use the code.
    @access Public (rate limited)
*/
router.post("/signup", async (req: Request, res: Response) => {
    const { website, ...d } = parse(signupSchema, req.body);
    // pretend it worked so bots don't retry; nothing is saved or sent
    if (website) return Ok(res, "Account ready, a code is on its way", null);
    limit(req.ip);
    let client = await Client.findOne({ email: d.email });
    if (!client) {
        client = await Client.create({ ...d, source: "signup", portal: true, followUpAt: new Date(Date.now() + 864e5) });
        void sendMail(env.CONTACT_EMAIL, `New portal signup: ${d.name}`, clientMail("team", "New signup", `${esc(d.name)} signed up.`,
            `${esc(d.name)}${d.company ? ` from ${esc(d.company)}` : ""} (${esc(d.email)}) created a portal account. They're a new lead in the CRM.`, "Open admin", `${site}/admin`));
    } else if (!client.portal) {
        client.portal = true;
    }
    await sendCode(client);
    return Ok(res, "Account ready, a code is on its way", null);
});

/*
    @route POST /api/portal/login
    @desc Swap the emailed code for a 30 day session token
    @access Public
*/
router.post("/login", async (req: Request, res: Response) => {
    const { email: e, code } = parse(z.object({ email, code: z.string().trim().regex(/^\d{6}$/, "The code is 6 digits") }), req.body);
    const client = await Client.findOne({ email: e, portal: true });
    const l = client?.login;
    if (!client || !l?.code || !l.exp || l.exp.getTime() < Date.now() || l.tries >= 5) throw new Unauthorized("That code has expired. Ask for a new one.");
    if (!crypto.timingSafeEqual(Buffer.from(hash(code)), Buffer.from(l.code))) {
        client.set("login.tries", l.tries + 1);
        await client.save();
        throw new Unauthorized("Wrong code, check the latest email.");
    }
    client.login = { code: "", exp: null, tries: 0 };
    await client.save();
    const token = jwt.sign({ role: "client", id: String(client._id) }, env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
    return Ok(res, "Logged in", { token });
});

// everything below needs a client token
type Authed = Request<{ id: string }> & { clientId?: string };
router.use((req: Request, res: Response, next: NextFunction) => {
    try {
        const t = jwt.verify(req.headers.authorization?.split(" ")[1] || "", env.ACCESS_TOKEN_SECRET);
        if (typeof t === "string" || t.role !== "client") throw new Error();
        (req as Authed).clientId = t.id;
    } catch { throw new Unauthorized("Please log in again."); }
    next();
});

const mine = async <T>(model: mongoose.Model<T>, req: Authed) => {
    const doc = mongoose.isValidObjectId(req.params.id) && (await model.findOne({ _id: req.params.id, client: req.clientId } as mongoose.FilterQuery<T>));
    if (!doc) throw new NotFound("Not found");
    return doc;
};

const invoiceView = (i: InstanceType<typeof Invoice>) => ({
    _id: i._id, number: i.number, title: i.title, amount: i.amount, dueAt: i.dueAt, status: i.status, paidAt: i.paidAt,
    upi: i.status === "due" ? upiLink(i) : "", auto: razorpayOn(),
});

/*
    @route GET /api/portal/me
    @desc Everything the portal shows: project, docs, invoices
    @access Client
*/
router.get("/me", async (req: Request, res: Response) => {
    const id = (req as Authed).clientId;
    const client = await Client.findOne({ _id: id, portal: true }).lean();
    if (!client) throw new Unauthorized("Your portal access was removed.");
    const [invoices, docs] = await Promise.all([
        Invoice.find({ client: id }).sort({ createdAt: -1 }),
        Doc.find({ client: id, status: { $ne: "draft" } }).sort({ createdAt: -1 }).select("title kind status sentAt them.at").lean(),
    ]);
    await Promise.all(invoices.filter((i) => i.status !== "paid").map(syncInvoice));
    return Ok(res, "Portal", {
        name: client.name, company: client.company, phase: client.phase, milestones: client.milestones, updates: client.updates.slice(0, 20),
        license: client.license?.key ? { state: licenseState(client.license), domain: client.license.domain, paidUntil: client.license.paidUntil } : null,
        invoices: invoices.map(invoiceView), docs,
    });
});

router.get("/docs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await mine(Doc, req);
    if (doc.status === "draft") throw new NotFound("Not found");
    const client = await Client.findById(doc.client).select("name company email").lean();
    const { us, them, ...rest } = doc.toObject();
    return Ok(res, "Document", { ...rest, clientInfo: client, us: { name: us?.name, image: us?.image, at: us?.at }, them: { name: them?.name, image: them?.image, at: them?.at } });
});

router.post("/docs/:id/sign", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await mine(Doc, req);
    if (doc.status !== "sent") throw new BadRequest(doc.status === "signed" ? "Already signed, thank you" : "Not ready to sign yet");
    const sig = parse(signSchema, req.body);
    doc.them = { ...sig, at: new Date(), ip: req.ip || "", hash: crypto.createHash("sha256").update(doc.body).digest("hex") };
    doc.status = "signed";
    await doc.save();
    void sendMail(env.CONTACT_EMAIL, `Signed: ${doc.title}`, clientMail("team", "Document signed", `${esc(sig.name)} signed it.`, `<b>${esc(doc.title)}</b> was signed just now.`, "Open admin", `${site}/admin`));
    return Ok(res, "Signed, thank you", null);
});

/*
    @route GET /api/portal/invoices/:id
    @desc Current invoice status; also checks Razorpay so the pay screen updates by itself
    @access Client
*/
router.get("/invoices/:id", async (req: Request<{ id: string }>, res: Response) => {
    const inv = await mine(Invoice, req);
    return Ok(res, "Invoice", invoiceView(await syncInvoice(inv)));
});

router.post("/invoices/:id/pay", async (req: Request<{ id: string }>, res: Response) => {
    const inv = await mine(Invoice, req);
    if (inv.status === "paid") throw new BadRequest("Already paid, thank you");
    if (!razorpayOn()) throw new BadRequest("Online payment isn't set up, pay by UPI instead");
    const client = await Client.findById(inv.client).select("name email").lean();
    return Ok(res, "Payment link", { url: await paymentLink(inv, { name: client!.name, email: client!.email }) });
});

// client paid by UPI QR: they tell us the reference, we confirm
router.post("/invoices/:id/claim", async (req: Request<{ id: string }>, res: Response) => {
    const inv = await mine(Invoice, req);
    const { utr } = parse(z.object({ utr: z.string().trim().regex(/^[A-Za-z0-9]{6,30}$/, "Enter the UTR / reference number from your UPI app") }), req.body);
    if (inv.status !== "due") throw new BadRequest("Already received");
    inv.status = "verifying";
    inv.utr = utr;
    await inv.save();
    void sendMail(env.CONTACT_EMAIL, `Check UPI payment: ${inv.number}`, clientMail("team", "Confirm a payment", `₹${inv.amount.toLocaleString("en-IN")} to verify.`,
        `${inv.number} (${esc(inv.title)}) says it was paid. UTR <b>${utr}</b>. Check your bank app, then mark it paid in admin.`, "Open admin", `${site}/admin`));
    return Ok(res, "Thanks, we'll confirm shortly", invoiceView(inv));
});

// exporting the router
export default router;
