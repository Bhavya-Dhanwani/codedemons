// Importing modules
import brevo from "../config/mail.config.js";
import logger from "../config/logger.config.js";
import env from "../config/env.config.js";

// "Name <email>" -> { name, email }
const [, senderName, senderEmail] = env.SENDING_USER.match(/^\s*"?(.*?)"?\s*<(.+)>\s*$/) ?? [, undefined, env.SENDING_USER];

export const mailOn = env.SEND_MAIL && !!env.BREVO_API_KEY;
const prod = env.NODE_ENV === "production";

// say once, at startup, why mail won't arrive (a live site with mail off looks like "the code never came")
if (prod && !mailOn) logger.error(`Mail is OFF (${[!env.SEND_MAIL && "SEND_MAIL is not true", !env.BREVO_API_KEY && "BREVO_API_KEY is empty"].filter(Boolean).join(", ")}). Login codes and client emails are not being sent.`);
if (prod && /localhost/.test(env.FRONTEND_URL)) logger.error(`FRONTEND_URL is ${env.FRONTEND_URL}: links in emails point to localhost. Set it to the live site URL.`);

// function to send the mails; resolves to false (never rejects) when Brevo fails
function sendMail(to: string, subject: string, html: string, replyTo?: { email: string; name?: string }): Promise<boolean> {
    if (mailOn) {
        return brevo.transactionalEmails
            .sendTransacEmail({
                sender: { name: senderName || undefined, email: senderEmail },
                to: [{ email: to }],
                replyTo,
                subject,
                htmlContent: html
            })
            .then(() => true)
            .catch((err) => {
                logger.error({ err, to, subject }, "Failed to send mail");
                return false;
            });
    }
    // production logs never get the body or subject: they carry login codes
    if (prod) logger.warn(`[Mail off] not sent to ${to}`);
    else logger.info(`[Mail Mock Log] To: ${to} | Subject: ${subject} | HTML: ${html}`);
    return Promise.resolve(true);
}

export default sendMail;
