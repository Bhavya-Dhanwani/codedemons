// importing modules
import { BrevoClient } from "@getbrevo/brevo";
import env from "./env.config.js";

// creating a brevo client for sending emails
const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

export default brevo;
