// The maintenance page visitors see while a site is down, designed on the CRM canvas (license.page.canvas).
// One renderer, kept as a plain-JS string so the same code runs in three places:
//   sdk.js (browser, into a shadow root), license-guard.mjs (client's server) and here in Node (designer preview).
// Every value from the lease is clamped, checked against a pattern or escaped; nothing is trusted as HTML.
// Layout: a 1280x720 stage scaled to fit (container query units); on tall phone screens it becomes one centred column.
// Keep the defaults in step with client/src/features/crm/lib/canvas.ts.

export const PAGE_JS = String.raw`
var HEX = /^#[0-9a-f]{6}$/i, LINK = /^(https:\/\/|mailto:|tel:)[^\s"'<>]*$/, IMG = /^https:\/\/[^\s"'<>()\\]+$/;
var FONTS = { sans: "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", serif: "Georgia,'Times New Roman',serif", mono: "ui-monospace,Menlo,Consolas,monospace", round: "ui-rounded,'SF Pro Rounded',Nunito,system-ui,sans-serif" };
var DEFAULT_HEADING = "Temporarily unavailable", DEFAULT_MESSAGE = "This website is under maintenance. Please check back soon.";
function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
function color(v, f) { return HEX.test(v || "") ? v : f; }
function num(v, min, max, f) { v = Number(v); return isFinite(v) ? Math.min(max, Math.max(min, v)) : f; }
function ink(h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150 ? "#ffffff" : "#0d0d12"; }

// pages saved before the canvas existed (heading / logo / colours / button) as the same centred layout
function classic(p, m) {
  var fg = color(p.fg, "#0d0d12"), ac = color(p.ac, "#2b3bff"), els = [];
  if (IMG.test(p.l || "")) els.push({ t: "image", x: 540, y: 150, w: 200, h: 80, src: p.l });
  els.push({ t: "text", x: 190, y: 250, w: 900, h: 90, text: p.h || DEFAULT_HEADING, size: 60, weight: 500, align: "center", color: fg, spacing: -0.03, lh: 1.1 });
  els.push({ t: "text", x: 290, y: 355, w: 700, h: 70, text: m || DEFAULT_MESSAGE, size: 21, align: "center", color: fg, opacity: 0.7, lh: 1.5 });
  if (p.bl && LINK.test(p.bu || "")) els.push({ t: "button", x: 520, y: 460, w: 240, h: 60, text: p.bl, href: p.bu, size: 18, weight: 500, align: "center", fill: ac, color: ink(ac), radius: 30 });
  return { bg: color(p.bg, "#f2f1ed"), els: els };
}

// a colour, or a two-colour gradient when the second one is set
function paint(a, b, angle) {
  var c1 = HEX.test(a || "") ? a : "", c2 = HEX.test(b || "") ? b : "";
  return c1 && c2 ? "linear-gradient(" + num(angle, 0, 360, 135) + "deg," + c1 + "," + c2 + ")" : c1;
}

function element(e, rank) {
  var t = e.t, x = num(e.x, -1280, 2560, 0), y = num(e.y, -720, 1440, 0), w = num(e.w, 4, 2560, 200), h = num(e.h, 4, 1440, 60);
  var st = "left:" + x / 12.8 + "%;top:" + y / 7.2 + "%;width:" + w / 12.8 + "%;height:" + h / 7.2 + "%;order:" + rank +
    ";opacity:" + num(e.opacity, 0, 1, 1) + ";--fs:" + num(e.size, 8, 240, 24) + ";--r:" + num(e.radius, 0, 720, 0);
  var bw = num(e.bw, 0, 40, 0), sh = num(e.shadow, 0, 1, 0), rot = num(e.rot, -180, 180, 0);
  if (bw) st += ";border:calc(" + bw + "*var(--u)) solid " + color(e.bc, "#0d0d12");
  if (sh) st += ";box-shadow:0 calc(" + Math.round(sh * 30) + "*var(--u)) calc(" + Math.round(sh * 80) + "*var(--u)) rgba(0,0,0," + (sh * 0.55).toFixed(2) + ")";
  if (rot) st += ";transform:rotate(" + rot + "deg)";
  var fill = paint(e.fill, e.fill2, e.fangle);
  if (t === "box") return "<div class=\"cd-e cd-box\" style=\"" + st + ";background:" + (fill || "#0d0d12") + "\"></div>";
  if (t === "image") return IMG.test(e.src || "") ? "<img class=\"cd-e cd-img\" alt=\"\" src=\"" + esc(e.src) + "\" style=\"" + st + ";object-fit:" + (e.fit === "cover" ? "cover" : "contain") + "\">" : "";
  st += ";color:" + color(e.color, "#0d0d12") + ";font-family:" + (FONTS[e.font] || FONTS.sans) + ";font-weight:" + num(e.weight, 100, 900, 400) +
    ";font-style:" + (e.italic ? "italic" : "normal") + ";letter-spacing:" + num(e.spacing, -0.2, 1, 0) + "em;line-height:" + num(e.lh, 0.7, 3, 1.2) +
    ";text-align:" + (e.align === "center" || e.align === "right" ? e.align : "left") + (e.upper ? ";text-transform:uppercase" : "") +
    (e.underline ? ";text-decoration:underline" : "");
  // gradient (or colour) painted into the letters instead of behind them
  if (fill) st += t === "text" && e.clip ? ";background:" + fill + ";-webkit-background-clip:text;background-clip:text;color:transparent" : ";background:" + fill;
  var text = esc(String(e.text || "").slice(0, 600));
  if (t === "button") {
    st += ";justify-content:" + (e.align === "left" ? "flex-start" : e.align === "right" ? "flex-end" : "center");
    var inner = (IMG.test(e.src || "") ? "<img alt=\"\" src=\"" + esc(e.src) + "\" style=\"height:1.4em;width:auto;flex:none\">" : "") + (text ? "<span>" + text + "</span>" : "");
    return LINK.test(e.href || "") ? "<a class=\"cd-e cd-btn\" rel=\"noopener\" href=\"" + esc(e.href) + "\" style=\"" + st + "\">" + inner + "</a>" : "<span class=\"cd-e cd-btn\" style=\"" + st + "\">" + inner + "</span>";
  }
  return "<div class=\"cd-e cd-text\" style=\"" + st + "\">" + text + "</div>";
}

// { title, css, body } for a lease that says "off"
function parts(lease) {
  var p = (lease && lease.p) || {}, c = p.c && p.c.els ? p.c : classic(p, lease && lease.m);
  var els = c.els.slice(0, 60), bg = color(c.bg, "#f2f1ed"), back = bg;
  // page gradient: linear (with angle) or radial, two or three colours
  if (HEX.test(c.bg2 || "")) {
    var stops = bg + "," + c.bg2 + (HEX.test(c.bg3 || "") ? "," + c.bg3 : "");
    back = c.bgType === "radial" ? "radial-gradient(circle at center," + stops + ")" : "linear-gradient(" + num(c.angle, 0, 360, 180) + "deg," + stops + ")";
  }
  if (IMG.test(c.img || "")) { var dim = "rgba(0,0,0," + num(c.dim, 0, 0.9, 0) + ")"; back = "linear-gradient(" + dim + "," + dim + "),url(\"" + esc(c.img) + "\") center/cover no-repeat," + back; }
  // on phones the column follows the canvas top to bottom
  var order = els.map(function (e, i) { return i; }).sort(function (a, b) { return num(els[a].y, -720, 1440, 0) - num(els[b].y, -720, 1440, 0) || num(els[a].x, -1280, 2560, 0) - num(els[b].x, -1280, 2560, 0); });
  var body = els.map(function (e, i) { return element(e, order.indexOf(i)); }).join("");
  var first = els.filter(function (e) { return e.t === "text" && e.text; })[0];
  var css = ".cd-root{position:fixed;inset:0;z-index:2147483647;margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:" + back + ";-webkit-font-smoothing:antialiased}" +
    ".cd-stage{position:relative;flex:none;width:min(100vw,177.778vh);aspect-ratio:16/9;container-type:size;--u:calc(1cqw/12.8)}" +
    ".cd-e{position:absolute;box-sizing:border-box;margin:0;overflow:hidden;overflow-wrap:break-word;white-space:pre-wrap;font-size:calc(var(--fs)*var(--u));border-radius:calc(var(--r)*var(--u))}" +
    ".cd-btn{display:flex;align-items:center;gap:.5em;text-decoration:none}.cd-img{object-fit:contain}" +
    "@media (max-aspect-ratio:4/5){.cd-root{display:block;overflow-y:auto}" +
    ".cd-stage{width:100%;aspect-ratio:auto;min-height:100%;container-type:inline-size;--u:.17cqw;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:56px 24px;box-sizing:border-box}" +
    ".cd-e{position:static;width:auto!important;height:auto!important;max-width:100%;text-align:center!important;font-size:max(14px,calc(var(--fs)*var(--u)))}" +
    ".cd-box{display:none}.cd-img{max-width:min(100%,240px);max-height:120px}.cd-btn{padding:.8em 1.6em;justify-content:center!important}}";
  return { title: first ? String(first.text).slice(0, 80) : DEFAULT_HEADING, css: css, body: "<div class=\"cd-root\"><div class=\"cd-stage\">" + body + "</div></div>" };
}

function page(lease) {
  var x = parts(lease);
  return "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=robots content=noindex>" +
    "<title>" + esc(x.title) + "</title><style>" + x.css + "</style></head><body style=\"margin:0\">" + x.body + "</body></html>";
}
`;

type Lease = { m?: string; p?: Record<string, unknown> };
/** Full HTML document for a lease, rendered by the same code the guard runs. */
export const maintenancePage = new Function(PAGE_JS + "\nreturn page;")() as (lease: Lease) => string;
