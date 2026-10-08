// Server-side license guard for clients' fullstack apps, served at /api/license/guard.mjs.
// Same lease and signature as sdk.js, but checked on the client's server before their app runs: while the
// license is off the real pages and API are never sent, so view-source, ad blockers and disabling JS don't help.
// Web-standard APIs only (crypto.subtle, fetch, atob, Response), so one file runs on Node 18+ and on edge
// runtimes (Next.js middleware, Vercel Edge, Cloudflare Workers, Bun, Deno).
// Kept as a plain string (no template literals inside) so __API__ / __PUB__ can be filled in per request.

// Types for TypeScript projects, served at /api/license/guard.d.mts (download next to license-guard.mjs).
export const GUARD_TYPES = `import type { IncomingMessage, ServerResponse } from "node:http";

export type LicenseVerdict = { off: false } | { off: true; html: string; message: string };

export type LicenseGuard = ((req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void) & {
  /** Edge / fetch-style frameworks: a 503 Response while the license is off, otherwise null. Never throws. */
  respond(request: Request): Promise<Response | null>;
  /** Anything else: render v.html (503) yourself when v.off. Never throws. */
  check(): Promise<LicenseVerdict>;
};

export function licenseGuard(options: {
  /** The LIC-... license key, e.g. process.env.CODEDEMONS_LICENSE */
  key: string;
  /** Lease endpoint base; defaults to codedemons. */
  api?: string;
  /** How often a live site re-checks, in ms (default 10 minutes). */
  refreshMs?: number;
}): LicenseGuard;
`;

export const GUARD = `// codedemons license guard (ESM). Node 18+ and edge runtimes. Download once into the project and commit it.
//
// Express / Connect / NestJS / plain http, before every other route and static files:
//   import { licenseGuard } from "./license-guard.mjs";
//   app.use(licenseGuard({ key: process.env.CODEDEMONS_LICENSE }));
//
// Next.js middleware, Vercel Edge, Cloudflare Workers, Hono, Bun, Deno (anything with Request/Response):
//   const guard = licenseGuard({ key: process.env.CODEDEMONS_LICENSE });
//   const blocked = await guard.respond(request); if (blocked) return blocked;
//
// While the license is off: browsers get the maintenance page, API calls get 503 JSON, the app never runs.
// If codedemons can't be reached, the last verified lease is used until it expires (max 7 days); the guard
// never takes the app down because of our outage or its own error.

var API = "__API__";
var PUB = "__PUB__";
var HEX = /^#[0-9a-f]{6}$/i, LINK = /^(https:|mailto:|tel:)/, IMG = /^https:\\/\\/[^\\s"'<>]+$/;
var DEFAULT_MESSAGE = "This website is under maintenance. Please check back soon.";

function b64(t) { t = t.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(t + "===".slice((t.length + 3) % 4)), function (c) { return c.charCodeAt(0); }); }
function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
function color(v, f) { return HEX.test(v || "") ? v : f; }
function ink(h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150 ? "#fff" : "#0d0d12"; }

var pubKey = null;
function key() {
  if (!pubKey) pubKey = crypto.subtle.importKey("raw", b64(PUB), { name: "Ed25519" }, false, ["verify"]).catch(function (e) {
    // a runtime without Ed25519 can't verify leases: say so loudly instead of silently never blocking
    console.error("[codedemons license] this runtime can't verify Ed25519 signatures; the license is not enforced.", e);
    throw e;
  });
  return pubKey;
}

// the maintenance page designed in the CRM; every value escaped or checked (same look as sdk.js)
function page(lease) {
  var p = lease.p || {}, bg = color(p.bg, "#f2f1ed"), fg = color(p.fg, "#0d0d12"), ac = color(p.ac, "#2b3bff");
  return "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content=\\"width=device-width,initial-scale=1\\"><meta name=robots content=noindex>" +
    "<title>" + esc(p.h || "Temporarily unavailable") + "</title></head>" +
    "<body style=\\"margin:0;min-height:100vh;display:grid;place-items:center;background:" + bg + ";color:" + fg + ";font:16px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box;text-align:center\\">" +
    "<div style=\\"max-width:440px;display:grid;justify-items:center;gap:14px;overflow-wrap:anywhere\\">" +
    (IMG.test(p.l || "") ? "<img src=\\"" + esc(p.l) + "\\" alt=\\"\\" style=\\"max-height:64px;max-width:200px;object-fit:contain;margin-bottom:8px\\">" : "") +
    "<h1 style=\\"font-size:32px;font-weight:500;letter-spacing:-.03em;line-height:1.1;margin:0\\">" + esc(p.h || "Temporarily unavailable") + "</h1>" +
    "<p style=\\"margin:0;opacity:.7\\">" + esc(lease.m || DEFAULT_MESSAGE) + "</p>" +
    (p.bl && LINK.test(p.bu || "") ? "<a href=\\"" + esc(p.bu) + "\\" rel=noopener style=\\"margin-top:8px;padding:12px 22px;border-radius:99px;background:" + ac + ";color:" + ink(ac) + ";text-decoration:none;font-weight:500\\">" + esc(p.bl) + "</a>" : "") +
    "</div></body></html>";
}

/**
 * @param {{ key: string, api?: string, refreshMs?: number }} options
 *   key: the LIC-... license key.  api: lease endpoint base (default: codedemons).
 *   refreshMs: how often a live site re-checks (default 10 min, same as the browser script).
 */
export function licenseGuard(options) {
  var licenseKey = options && options.key, api = (options && options.api) || API, refreshMs = (options && options.refreshMs) || 6e5;
  if (!licenseKey) throw new Error("licenseGuard: pass { key: process.env.CODEDEMONS_LICENSE }");
  var lease = null, tried = false, lastFail = 0, pending = null;

  async function decode(t) {
    var parts = String(t || "").split(".");
    if (parts.length !== 2) return null;
    var ok = await crypto.subtle.verify("Ed25519", await key(), b64(parts[1]), new TextEncoder().encode(parts[0]));
    if (!ok) return null;
    var d = JSON.parse(new TextDecoder().decode(b64(parts[0])));
    return d.k === licenseKey ? d : null;
  }
  async function load() {
    var r = await fetch(api + "/lease/" + encodeURIComponent(licenseKey), { signal: AbortSignal.timeout(5000) });
    // key deleted or replaced in the CRM: down until the new key is set
    if (r.status === 404) { lease = { k: licenseKey, s: "off", m: "", iat: Date.now(), exp: Infinity }; return; }
    var j = await r.json();
    var d = await decode(j && j.data && j.data.lease);
    if (d) lease = d;
  }
  function renew() {
    tried = true;
    if (!pending) pending = load().catch(function () { lastFail = Date.now(); }).finally(function () { pending = null; });
    return pending;
  }

  /** Current verdict: { off: false } or { off: true, html, message }. Never throws. */
  async function check() {
    try {
      var now = Date.now();
      // live: re-check every refreshMs in the background; down: every 30s so switching on is quick
      var maxAge = lease && lease.s === "off" ? 3e4 : refreshMs;
      // after a failed fetch (we're down) wait 30s before trying again, instead of on every request
      if ((!lease || now - lease.iat >= maxAge) && now - lastFail >= 3e4) {
        var wait = !tried;           // only the very first request waits (up to 5s); later ones use the last lease
        var p = renew();
        if (wait) await p;
      }
      if (!lease) return { off: false };   // never reached codedemons: fail open
      if (lease.s === "off" || lease.exp < now) return { off: true, html: page(lease), message: lease.m || DEFAULT_MESSAGE };
      return { off: false };
    } catch (e) { return { off: false }; }
  }

  var HEADERS = { "Retry-After": "600", "Cache-Control": "no-store" };
  function wantsHtml(accept) { return String(accept || "").indexOf("text/html") !== -1; }

  // Node: Express / Connect / NestJS / http
  function guard(req, res, next) {
    check().then(function (v) {
      if (!v.off) return next();
      res.statusCode = 503;
      for (var h in HEADERS) res.setHeader(h, HEADERS[h]);
      var html = wantsHtml(req.headers.accept);
      res.setHeader("Content-Type", html ? "text/html; charset=utf-8" : "application/json; charset=utf-8");
      res.end(html ? v.html : JSON.stringify({ success: false, message: v.message }));
    });
  }

  // edge / fetch-style: Next.js middleware, Workers, Hono, Bun, Deno
  guard.respond = async function (request) {
    var v = await check();
    if (!v.off) return null;
    var html = wantsHtml(request && request.headers && request.headers.get("accept"));
    return new Response(html ? v.html : JSON.stringify({ success: false, message: v.message }), {
      status: 503,
      headers: Object.assign({ "Content-Type": html ? "text/html; charset=utf-8" : "application/json; charset=utf-8" }, HEADERS),
    });
  };
  guard.check = check;
  return guard;
}
`;
