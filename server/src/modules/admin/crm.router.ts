// Importing modules
import express, { Request, Response } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";
import z from "zod";
import Client, { STAGES, PHASES } from "../../shared/models/client.model.js";
import Invoice from "../../shared/models/invoice.model.js";
import Doc from "../../shared/models/doc.model.js";
import NotFound from "../../shared/errors/NotFound.error.js";
import BadRequest from "../../shared/errors/BadRequest.error.js";
import Ok from "../../shared/responses/Ok.response.js";
import Created from "../../shared/responses/Created.response.js";
import sendMail from "../../shared/utils/sendMail.util.js";
import { clientMail, licenseState, markPaid, newLicenseKey } from "../../shared/utils/crm.util.js";
import { esc } from "../public/contact/contact.mail.js";
import { parse } from "./admin.controller.js";

// mounted behind the admin middleware
const router = express.Router();

const text = (max: number) => z.string().trim().max(max);
const date = z.union([z.null(), z.coerce.date()]); // null first: coerce turns null into 1970
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, "Colours must look like #1a2b3c");
const signSchema = z.object({ name: text(120).min(2, "Type your full name"), image: z.string().max(90_000).regex(/^data:image\/png;base64,[\w+/=]+$/, "Draw your signature") });

const clientSchema = z.object({
    name: text(120).min(1, "Name is required"),
    email: z.union([z.literal(""), z.string().trim().toLowerCase().email("That email doesn't look right").max(200)]),
    phone: text(40),
    company: text(120),
    services: z.array(text(40)).max(12),
    message: text(4000),
    stage: z.enum(STAGES),
    value: z.coerce.number().min(0).max(1e9),
    followUpAt: date,
    phase: z.enum(PHASES),
    milestones: z.array(z.object({ title: text(120).min(1), done: z.boolean() })).max(30),
    license: z.object({
        domain: text(200).toLowerCase().transform((d) => d.replace(/^https?:\/\//, "").replace(/\/.*$/, "")),
        on: z.boolean(),
        paidUntil: date,
        graceDays: z.coerce.number().int().min(0).max(90),
        message: text(300),
        page: z.object({
            heading: text(80),
            // an ImageKit URL (uploads only go there), shown as-is on the client's site
            logo: z.union([z.literal(""), z.string().trim().max(500).regex(/^https:\/\/[^\s"'<>]+$/, "Logo must be an uploaded image")]),
            bg: hex, fg: hex, accent: hex,
            buttonLabel: text(40),
            buttonUrl: z.union([z.literal(""), z.string().trim().max(300).regex(/^(https:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[\d+\s()-]+)$/, "Button link must start with https://, mailto: or tel:")]),
        }),
    }).partial(),
}).partial();

async function find(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new NotFound("Client not found");
    const client = await Client.findById(id);
    if (!client) throw new NotFound("Client not found");
    return client;
}
const byId = async <T>(model: mongoose.Model<T>, id: string) => {
    const doc = mongoose.isValidObjectId(id) && (await model.findById(id));
    if (!doc) throw new NotFound("Not found");
    return doc;
};

// strip the login secret before anything leaves the server
const view = (c: InstanceType<typeof Client>) => {
    const { login, ...rest } = c.toObject();
    void login;
    return { ...rest, licenseState: licenseState(c.license) };
};

// ---------- dashboard numbers ----------
router.get("/crm/summary", async (req: Request, res: Response) => {
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [due, open, unpaid, received] = await Promise.all([
        Client.countDocuments({ followUpAt: { $lte: endOfDay }, stage: { $nin: ["lost"] } }),
        Client.aggregate([{ $match: { stage: { $in: ["new", "contacted", "proposal"] } } }, { $group: { _id: null, v: { $sum: "$value" }, n: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: { status: { $ne: "paid" } } }, { $group: { _id: null, v: { $sum: "$amount" }, n: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: { status: "paid", paidAt: { $gte: monthStart } } }, { $group: { _id: null, v: { $sum: "$amount" } } }]),
    ]);
    return Ok(res, "Summary", {
        due, openValue: open[0]?.v ?? 0, openCount: open[0]?.n ?? 0,
        unpaidValue: unpaid[0]?.v ?? 0, unpaidCount: unpaid[0]?.n ?? 0, receivedThisMonth: received[0]?.v ?? 0,
    });
});

// ---------- clients / leads ----------
router.get("/clients", async (req: Request, res: Response) => {
    const { view: v = "all", q = "" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (v === "due") Object.assign(filter, { followUpAt: { $lte: new Date(new Date().setHours(23, 59, 59, 999)) }, stage: { $ne: "lost" } });
    else if ((STAGES as readonly string[]).includes(v)) filter.stage = v;
    if (q) {
        const rx = new RegExp(String(q).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
    }
    const clients = await Client.find(filter).sort(v === "due" ? { followUpAt: 1 } : { updatedAt: -1 }).limit(300)
        .select("name email company stage value followUpAt portal phase source createdAt").lean();
    return Ok(res, "Clients", clients);
});

router.post("/clients", async (req: Request, res: Response) => {
    const data = parse(clientSchema.required({ name: true }), req.body);
    const client = await Client.create(data);
    return Created(res, "Client added", view(client));
});

router.get("/clients/:id", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    const [invoices, docs] = await Promise.all([
        Invoice.find({ client: client._id }).sort({ createdAt: -1 }).lean(),
        Doc.find({ client: client._id }).sort({ createdAt: -1 }).select("-body -us.image -them.image").lean(),
    ]);
    return Ok(res, "Client", { ...view(client), invoices, docs });
});

router.put("/clients/:id", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    const { license, ...data } = parse(clientSchema, req.body);
    client.set(data);
    if (license) client.set(Object.fromEntries(Object.entries(license).map(([k, v]) => [`license.${k}`, v])));
    await client.save();
    return Ok(res, "Saved", view(client));
});

router.delete("/clients/:id", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    await Promise.all([Invoice.deleteMany({ client: client._id }), Doc.deleteMany({ client: client._id }), client.deleteOne()]);
    return Ok(res, "Deleted");
});

router.post("/clients/:id/notes", async (req: Request<{ id: string }>, res: Response) => {
    const { text: t } = parse(z.object({ text: text(2000).min(1, "Write something") }), req.body);
    const client = await find(req.params.id);
    client.notes.unshift({ text: t, at: new Date() });
    await client.save();
    return Created(res, "Note added", view(client));
});

// a progress update the client sees (and gets emailed)
router.post("/clients/:id/updates", async (req: Request<{ id: string }>, res: Response) => {
    const { text: t } = parse(z.object({ text: text(2000).min(1, "Write something") }), req.body);
    const client = await find(req.params.id);
    client.updates.unshift({ text: t, at: new Date() });
    await client.save();
    if (client.portal && client.email) void sendMail(client.email, "New update on your project", clientMail(client.name, "Project update", "Here's what's new.", esc(t).replace(/\n/g, "<br>"), "See your project"));
    return Created(res, "Update posted", view(client));
});

// gives the client portal access and emails them how to log in
router.post("/clients/:id/invite", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    if (!client.email) throw new BadRequest("Add an email for this client first");
    client.portal = true;
    await client.save();
    await sendMail(client.email, "Your codedemons project portal", clientMail(client.name, "Your portal is ready", "Everything in one place.",
        `Follow your project, sign documents and pay invoices from your portal. Log in with <b>${esc(client.email)}</b>, we'll email you a one-time code. No password to remember.`));
    return Ok(res, "Invite sent", view(client));
});

// creates the license, or replaces the key (old key stops working)
router.post("/clients/:id/license", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    client.set("license.key", newLicenseKey());
    await client.save();
    return Ok(res, "License key ready", view(client));
});

// ---------- invoices ----------
const invoiceSchema = z.object({
    title: text(200).min(1, "What is this payment for?"),
    amount: z.coerce.number().min(1, "Amount must be at least ₹1").max(1e8),
    dueAt: z.coerce.date(),
    licenseDays: z.coerce.number().int().min(0).max(3650).default(0),
});

router.post("/clients/:id/invoices", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    const data = parse(invoiceSchema, req.body);
    const last = await Invoice.findOne().sort({ createdAt: -1 }).select("number").lean();
    const n = Number(last?.number.replace(/\D/g, "") || 1000) + 1;
    const inv = await Invoice.create({ ...data, client: client._id, number: `INV-${n}` });
    if (client.portal && client.email) void sendMail(client.email, `New invoice: ${inv.title}`, clientMail(client.name, "New invoice", "Pay in a few seconds.",
        `<b>₹${inv.amount.toLocaleString("en-IN")}</b> for ${esc(inv.title)}, due ${inv.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`, "Pay now"));
    return Created(res, "Invoice created", inv);
});

router.post("/invoices/:id/paid", async (req: Request<{ id: string }>, res: Response) => {
    const inv = await byId(Invoice, req.params.id);
    await markPaid(inv);
    return Ok(res, "Marked as paid", inv);
});

router.delete("/invoices/:id", async (req: Request<{ id: string }>, res: Response) => {
    const inv = await byId(Invoice, req.params.id);
    if (inv.status === "paid") throw new BadRequest("Paid invoices are kept for your records");
    await inv.deleteOne();
    return Ok(res, "Deleted");
});

// ---------- documents ----------
const docSchema = z.object({ kind: text(40).default(""), title: text(200).min(1, "Give it a title"), body: z.string().max(60_000) });

router.post("/clients/:id/docs", async (req: Request<{ id: string }>, res: Response) => {
    const client = await find(req.params.id);
    const doc = await Doc.create({ ...parse(docSchema, req.body), client: client._id });
    return Created(res, "Document created", doc);
});

router.get("/docs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await byId(Doc, req.params.id);
    const client = await Client.findById(doc.client).select("name company email").lean();
    return Ok(res, "Document", { ...doc.toObject(), clientInfo: client });
});

router.put("/docs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await byId(Doc, req.params.id);
    if (doc.status !== "draft") throw new BadRequest("Sent documents can't be edited. Make a new version instead.");
    doc.set(parse(docSchema.partial(), req.body));
    doc.set("us", {}); // our signature covered the old text
    await doc.save();
    return Ok(res, "Saved", doc);
});

router.post("/docs/:id/send", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await byId(Doc, req.params.id);
    const client = await Client.findById(doc.client);
    if (!client?.email) throw new BadRequest("Add an email for this client first");
    if (doc.status === "signed") throw new BadRequest("Already signed");
    doc.status = "sent";
    doc.sentAt = new Date();
    await doc.save();
    client.portal = true; // they need the portal to sign
    await client.save();
    await sendMail(client.email, `Please review and sign: ${doc.title}`, clientMail(client.name, "Document to sign", "One quick signature.",
        `We've shared <b>${esc(doc.title)}</b> with you. Read it in your portal and sign right on the page.`, "Review and sign"));
    return Ok(res, "Sent to client", doc);
});

// our side of the signature
router.post("/docs/:id/sign", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await byId(Doc, req.params.id);
    const sig = parse(signSchema, req.body);
    doc.us = { ...sig, at: new Date(), ip: req.ip || "", hash: crypto.createHash("sha256").update(doc.body).digest("hex") };
    await doc.save();
    return Ok(res, "Signed", doc);
});

router.delete("/docs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const doc = await byId(Doc, req.params.id);
    if (doc.status === "signed") throw new BadRequest("Signed documents are kept for your records");
    await doc.deleteOne();
    return Ok(res, "Deleted");
});

export { signSchema };
export default router;
