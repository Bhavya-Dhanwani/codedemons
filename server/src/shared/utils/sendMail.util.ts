// Importing modules
import brevo from "../config/mail.config.js";
import logger from "../config/logger.config.js";
import env from "../config/env.config.js";

// "Name <email>" -> { name, email }
const [, senderName, senderEmail] = env.SENDING_USER.match(/^\s*"?(.*?)"?\s*<(.+)>\s*$/) ?? [, undefined, env.SENDING_USER];

// function to send the mails; resolves to false (never rejects) when Brevo fails
function sendMail(to: string, subject: string, html: string, replyTo?: { email: string; name?: string }): Promise<boolean> {
    if (env.SEND_MAIL) {
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
    logger.info(`[Mail Mock Log] To: ${to} | Subject: ${subject} | HTML: ${html}`);
    return Promise.resolve(true);
}

export default sendMail;
