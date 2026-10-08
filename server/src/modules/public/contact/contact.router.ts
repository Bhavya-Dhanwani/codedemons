// Importing modules
import express, { Request, Response } from "express";
import z from "zod";
import env from "../../../shared/config/env.config.js";
import sendMail from "../../../shared/utils/sendMail.util.js";
import BadRequest from "../../../shared/errors/BadRequest.error.js";
import ApiError from "../../../shared/utils/ApiError.util.js";
import Ok from "../../../shared/responses/Ok.response.js";
import Client from "../../../shared/models/client.model.js";
import { inquiryMail, thankYouMail } from "./contact.mail.js";

// making the router
const router = express.Router();

const line = (max: number) => z.string().trim().max(max).regex(/^[^\r\n\t]*$/, "must be a single line");
const contactSchema = z.object({
    name: line(100).min(2, "Please tell us your name"),
    email: z.string().trim().toLowerCase().email("That email doesn't look right").max(200),
    company: line(120).default(""),
    services: z.array(line(40)).max(8).default([]),
    message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(4000),
    website: z.string().max(200).default(""), // honeypot: real people never see this field
});

// ponytail: in-memory per-IP limit, resets on restart; move to Redis if we run several instances
const sent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

/*
    @route POST /api/contact
    @desc Contact form: thank-you mail to the sender, inquiry mail to our inbox
    @access Public (rate limited)
*/
router.post("/contact", async (req: Request, res: Response) => {
    const result = contactSchema.safeParse(req.body);
    if (!result.success) throw new BadRequest(result.error.issues[0].message);
    const { website, ...inquiry } = result.data;

    // bots fill the honeypot; pretend it worked so they don't retry
    if (website) return Ok(res, "Message sent", null);

    const ip = req.ip || "unknown";
    const now = Date.now();
    const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= LIMIT) throw new ApiError(429, "You've sent a few messages already. Please try again later or email us directly.");
    sent.set(ip, [...recent, now]);

    // saved as a lead first, so nothing is lost if mail is down; follow up within a day
    const saved = await Client.create({ ...inquiry, source: "form", followUpAt: new Date(now + 864e5) }).then(() => true, () => false);

    // the inquiry must reach us (in the CRM or our inbox); only then thank the sender
    const ours = inquiryMail(inquiry);
    const delivered = await sendMail(env.CONTACT_EMAIL, ours.subject, ours.html, { email: inquiry.email, name: inquiry.name });
    if (!delivered && !saved) throw new ApiError(502, `We couldn't send that just now. Please email us at ${env.CONTACT_EMAIL}.`);

    const theirs = thankYouMail(inquiry);
    void sendMail(inquiry.email, theirs.subject, theirs.html, { email: env.CONTACT_EMAIL });

    return Ok(res, "Message sent", null);
});

// exporting the router
export default router;
