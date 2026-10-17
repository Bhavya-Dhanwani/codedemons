// Client projects: shared by the CRM (studio side) and the portal (client side)
import z from "zod";
import env from "../config/env.config.js";
import Client, { PHASES } from "../models/client.model.js";
import ClientProject from "../models/clientProject.model.js";
import sendMail from "./sendMail.util.js";
import BadRequest from "../errors/BadRequest.error.js";
import { clientMail } from "./crm.util.js";
import { esc, site } from "../../modules/public/contact/contact.mail.js";

type Side = "client" | "studio";
type ProjectDoc = InstanceType<typeof ClientProject>;
const other = (s: Side): Side => (s === "client" ? "studio" : "client");

const text = (max: number) => z.string().trim().max(max);
export const projectSchema = z.object({
    name: text(120).min(2, "Give the project a name"),
    brief: text(6000),
    services: z.array(text(40)).max(12),
    budget: text(60),
    deadline: z.union([z.null(), z.coerce.date()]),
    phase: z.enum(PHASES),
    milestones: z.array(z.object({ title: text(120).min(1), done: z.boolean() })).max(30),
}).partial();
export const messageSchema = z.object({ text: text(4000).min(1, "Write something") });

// Before projects existed, phase / milestones / updates lived on the client. Move them into a first project once.
export async function adoptLegacy(clientId: unknown) {
    if (await ClientProject.exists({ client: clientId })) return;
    const c = await Client.findById(clientId).select("company phase milestones updates").lean();
    if (!c || (!c.milestones?.length && !c.updates?.length && c.phase === "planning")) return;
    await ClientProject.create({ client: clientId, name: c.company ? `${c.company} website` : "Website", phase: c.phase, milestones: c.milestones, updates: c.updates });
}

type Stamps = { client?: Date | null; studio?: Date | null } | null;
const unread = (p: { lastFrom?: Stamps; readAt?: Stamps }, me: Side) => {
    const last = p.lastFrom?.[other(me)];
    const read = p.readAt?.[me];
    return !!last && (!read || last > read);
};

// list rows for one client, newest first
export async function projectRows(clientId: unknown, me: Side) {
    await adoptLegacy(clientId);
    const rows = await ClientProject.find({ client: clientId }).sort({ updatedAt: -1 }).select("name phase milestones lastFrom readAt createdAt updatedAt").lean();
    return rows.map(({ lastFrom, readAt, milestones, ...r }) => ({
        ...r, unread: unread({ lastFrom, readAt }, me),
        done: milestones.filter((m) => m.done).length, total: milestones.length,
    }));
}

// the full project; opening it marks the other side's messages as read
export async function openProject(p: ProjectDoc, me: Side) {
    const wasUnread = unread(p, me);
    if (wasUnread) { p.set(`readAt.${me}`, new Date()); await p.save(); }
    const { lastFrom, readAt, ...rest } = p.toObject();
    void lastFrom;
    // when the other side last read, so the sender sees "Seen"
    return { ...rest, seenAt: readAt?.[other(me)] ?? null };
}

// a message; the other side gets one email per batch (only when this starts a new unread run)
export async function postMessage(p: ProjectDoc, from: Side, t: string) {
    // ponytail: per-project limits instead of a global rate limiter; enough to stop one client flooding a thread
    if (p.messages.length >= 2000) throw new BadRequest("This conversation is full. Start a new project or email us.");
    const recent = p.messages.filter((m) => m.from === from && m.at && Date.now() - m.at.getTime() < 60_000).length;
    if (recent >= 10) throw new BadRequest("You're sending messages very fast. Wait a minute and try again.");
    const alreadyPinged = unread(p, other(from));
    const now = new Date();
    p.messages.push({ from, text: t, at: now });
    p.set(`lastFrom.${from}`, now);
    p.set(`readAt.${from}`, now);
    await p.save();
    if (alreadyPinged) return;
    const client = await Client.findById(p.client).select("name email portal").lean();
    if (!client) return;
    const body = `<b>${esc(p.name)}</b><br><br>${esc(t).replace(/\n/g, "<br>")}`;
    if (from === "client") void sendMail(env.CONTACT_EMAIL, `Message from ${client.name}: ${p.name}`, clientMail("team", "New message", `${esc(client.name)} wrote.`, body, "Reply in admin", `${site}/admin`));
    else if (client.portal && client.email) void sendMail(client.email, `New message on ${p.name}`, clientMail(client.name, "New message", "We replied.", body, "Reply", `${site}/portal/projects/${p._id}`));
}

// client ids (of these) with a client message we haven't read
export async function clientsWithUnread() {
    const rows = await ClientProject.find({ "lastFrom.client": { $ne: null }, $expr: { $or: [{ $eq: ["$readAt.studio", null] }, { $gt: ["$lastFrom.client", "$readAt.studio"] }] } }).select("client").lean();
    return new Set(rows.map((r) => String(r.client)));
}
