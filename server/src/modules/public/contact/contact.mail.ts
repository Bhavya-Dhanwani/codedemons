// Email templates for the contact form. Table layout + inline styles so they survive Gmail/Outlook.
import env from "../../../shared/config/env.config.js";

export type Inquiry = { name: string; email: string; company: string; services: string[]; message: string };

// every user-supplied value goes through this before touching HTML
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

const SANS = "'Inter Tight',Helvetica,Arial,sans-serif";
const SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif";
const MONO = "'JetBrains Mono',Menlo,Consolas,monospace";
const BLUE = "#2b3bff";
const site = env.FRONTEND_URL.replace(/\/$/, "");

const label = (t: string, color = BLUE) =>
    `<div style="font:500 11px/1.4 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${color};">${t}</div>`;

const button = (href: string, text: string) =>
    `<a href="${href}" style="display:inline-block;padding:16px 30px;border-radius:999px;background:${BLUE};color:#ffffff;font:500 16px/1 ${SANS};text-decoration:none;">${text}</a>`;

// shared shell: warm paper background, dark rounded header with the two-demon mark, white body
function shell(preheader: string, tag: string, headline: string, accent: string, body: string) {
    return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f2f1ed;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ed;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
  <tr><td style="background:#0b0b10;border-radius:28px 28px 0 0;padding:36px 40px 44px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:4px;"><div style="width:14px;height:24px;border-radius:999px;background:#ffffff;"></div></td>
      <td style="padding-right:10px;"><div style="width:14px;height:18px;border-radius:999px;background:${BLUE};margin-top:6px;"></div></td>
      <td style="font:600 20px/1 ${SANS};letter-spacing:-.04em;color:#f2f1ed;">codedemons</td>
    </tr></table>
    <div style="height:44px;"></div>
    ${label(tag, "#ffffff80")}
    <div style="height:14px;"></div>
    <div style="font:500 44px/1 ${SANS};letter-spacing:-.045em;color:#ffffff;">${headline}</div>
    <div style="font:italic 400 48px/1.05 ${SERIF};letter-spacing:-.02em;color:${BLUE};">${accent}</div>
  </td></tr>
  <tr><td style="background:#ffffff;border-radius:0 0 28px 28px;padding:40px;font:400 16px/1.6 ${SANS};color:#0d0d12;">
    ${body}
  </td></tr>
  <tr><td align="center" style="padding:28px 16px;font:500 11px/1.8 ${MONO};letter-spacing:.06em;text-transform:uppercase;color:#6e6d73;">
    <a href="${site}" style="color:#6e6d73;text-decoration:none;">codedemons</a> &middot; Design &amp; Development Studio<br>
    <a href="https://bhavyadhanwani.dev" style="color:#6e6d73;">Bhavya Dhanwani</a> &amp; <a href="https://sameerbhagtani.dev" style="color:#6e6d73;">Sameer Bhagtani</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// rows of "LABEL / value" for the inquiry summary
function details(i: Inquiry) {
    const rows: [string, string][] = [
        ["Name", esc(i.name)],
        ["Email", `<a href="mailto:${esc(i.email)}" style="color:${BLUE};">${esc(i.email)}</a>`],
    ];
    if (i.company) rows.push(["Company", esc(i.company)]);
    if (i.services.length) rows.push(["Interested in", esc(i.services.join(", "))]);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
        .map(([k, v]) => `<tr><td style="padding:12px 0;border-bottom:1px solid #d9d7d0;width:130px;vertical-align:top;">${label(k, "#6e6d73")}</td><td style="padding:12px 0;border-bottom:1px solid #d9d7d0;font:400 16px/1.4 ${SANS};color:#0d0d12;">${v}</td></tr>`)
        .join("")}</table>`;
}

const quote = (m: string) =>
    `<div style="margin-top:24px;padding:20px 24px;border-left:3px solid ${BLUE};background:#f2f1ed;border-radius:0 16px 16px 0;font:400 15px/1.6 ${SANS};color:#0d0d12;">${nl2br(m)}</div>`;

// sent to the person who filled the form
export function thankYouMail(i: Inquiry) {
    const first = esc(i.name.split(/\s+/)[0]);
    return {
        subject: `We got your message, ${i.name.split(/\s+/)[0]} 👋`,
        html: shell(
            "Thanks for reaching out. A founder will reply within 24 hours.",
            "Message received",
            `Thanks, ${first}.`,
            "Consider us summoned.",
            `<p style="margin:0 0 16px;">Your message just landed with both founders. No account managers, no ticket queue: one of us will read it personally and get back to you <b>within 24 hours</b>.</p>
            <p style="margin:0 0 28px;">Here's a copy of what you sent us:</p>
            ${details(i)}
            ${quote(i.message)}
            <div style="height:32px;"></div>
            <p style="margin:0 0 20px;">While you wait, have a look at what we've been building.</p>
            ${button(`${site}/work`, "See our work &rarr;")}
            <p style="margin:32px 0 0;color:#6e6d73;">Talk soon,<br><span style="font:italic 400 22px/1.4 ${SERIF};color:#0d0d12;">Bhavya &amp; Sameer</span></p>`,
        ),
    };
}

// sent to our inbox
export function inquiryMail(i: Inquiry) {
    return {
        subject: `New inquiry: ${i.name}${i.company ? ` (${i.company})` : ""}`,
        html: shell(
            `${i.name} wants to talk${i.services.length ? ` about ${i.services.join(", ")}` : ""}.`,
            "New inquiry",
            `${esc(i.name)}`,
            "wants to work with us.",
            `${details(i)}
            ${quote(i.message)}
            <div style="height:32px;"></div>
            ${button(`mailto:${esc(i.email)}?subject=${encodeURIComponent("Re: your project with codedemons")}`, `Reply to ${esc(i.name.split(/\s+/)[0])} &rarr;`)}
            <p style="margin:24px 0 0;font:500 11px/1.6 ${MONO};letter-spacing:.06em;text-transform:uppercase;color:#6e6d73;">Hitting reply also goes straight to them. We promised 24h.</p>`,
        ),
    };
}
