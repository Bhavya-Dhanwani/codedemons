// Server-side license guard for clients' fullstack apps, served at /api/license/guard.mjs.
// Same lease and signature as sdk.js, but checked on the client's server before their app runs: while the
// license is off the real pages and API are never sent, so view-source, ad blockers and disabling JS don't help.
// Web-standard APIs only (crypto.subtle, fetch, atob, Response), so one file runs on Node 18+ and on edge
// runtimes (Next.js middleware, Vercel Edge, Cloudflare Workers, Bun, Deno).
// Kept as a plain string (no template literals inside) so __API__ / __PUB__ can be filled in per request.
import { PAGE_JS } from "./license.page.js";

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
function b64(t) { t = t.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(t + "===".slice((t.length + 3) % 4)), function (c) { return c.charCodeAt(0); }); }
var pubKey = null;
function key() {
  if (!pubKey) pubKey = crypto.subtle.importKey("raw", b64(PUB), { name: "Ed25519" }, false, ["verify"]).catch(function (e) {
    // a runtime without Ed25519 can't verify leases: say so loudly instead of silently never blocking
    console.error("[codedemons license] this runtime can't verify Ed25519 signatures; the license is not enforced.", e);
    throw e;
  });
  return pubKey;
}

// the maintenance page designed in the CRM (shared with sdk.js, see license.page.ts)
${PAGE_JS}
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
