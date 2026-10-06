// Importing modules
import brevo from "../config/mail.config.js";
import logger from "../config/logger.config.js";
import env from "../config/env.config.js";

// "Name <email>" -> { name, email }
const [, senderName, senderEmail] = env.SENDING_USER.match(/^\s*"?(.*?)"?\s*<(.+)>\s*$/) ?? [, undefined, env.SENDING_USER];

// function to send the mails
function sendMail(to: string, subject: string, html: string) {
    if (env.SEND_MAIL) {
        brevo.transactionalEmails
            .sendTransacEmail({
                sender: { name: senderName || undefined, email: senderEmail },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
            .catch((err) => logger.error({ err, to, subject }, "Failed to send mail"));
    } else {
        logger.info(`[Mail Mock Log] To: ${to} | Subject: ${subject} | HTML: ${html}`);
    }
}

export default sendMail;
