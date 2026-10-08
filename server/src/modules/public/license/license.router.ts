// Importing modules
import express, { Request, Response, NextFunction } from "express";
import Client from "../../../shared/models/client.model.js";
import NotFound from "../../../shared/errors/NotFound.error.js";
import Ok from "../../../shared/responses/Ok.response.js";
import { lease, publicKey } from "../../../shared/utils/crm.util.js";
import { cachedLicense, readStarted, rememberLicense } from "../../../shared/utils/licenseCache.util.js";
import { site } from "../contact/contact.mail.js";
import { GUARD, GUARD_TYPES } from "./license.guard.js";

// making the router
const router = express.Router();

// client websites live on other domains
router.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});

/*
    @route GET /api/license/lease/:key
    @desc A signed lease the website verifies offline with our public key
    @access Public
*/
router.get("/lease/:key", async (req: Request<{ key: string }>, res: Response) => {
    const key = String(req.params.key).slice(0, 40);
    let license = cachedLicense(key);
    if (!license) {
        const started = readStarted();
        const client = await Client.findOne({ "license.key": key }).select("license").lean();
        // unknown keys aren't cached, so random keys can't fill memory
        if (!client?.license?.key) throw new NotFound("Unknown license");
        license = client.license;
        rememberLicense(key, String(client._id), license, started);
    }
    res.setHeader("Cache-Control", "no-store");
    // signed fresh every time (~0.04 ms): the status and dates follow the current time
    return Ok(res, "Lease", { lease: lease(license) });
});

/*
    @route GET /api/license/sdk.js
    @desc Drop-in script: <script src="https://codedemons.in/api/license/sdk.js" data-key="LIC-..."></script>
    @access Public
*/
router.get("/sdk.js", (req: Request, res: Response) => {
    res.type("application/javascript").setHeader("Cache-Control", "public, max-age=3600");
    res.send(SDK.replace("__PUB__", publicKey));
});

/*
    @route GET /api/license/guard.mjs
    @desc Server-side guard for clients' Node backends (fullstack apps); see license.guard.ts
    @access Public
*/
router.get("/guard.mjs", (req: Request, res: Response) => {
    res.type("application/javascript").setHeader("Content-Disposition", 'inline; filename="license-guard.mjs"');
    res.send(GUARD.replace("__API__", `${site}/api/license`).replace("__PUB__", publicKey));
});

// TypeScript declarations for the guard (license-guard.d.mts)
router.get("/guard.d.mts", (req: Request, res: Response) => {
    res.type("text/plain").setHeader("Content-Disposition", 'inline; filename="license-guard.d.mts"');
    res.send(GUARD_TYPES);
});

// Renders from the stored lease straight away, renews in the background, and only blocks when
// a lease we signed says "off" (or an offline site's lease ran out). Our server being down never blocks a site.
const SDK = `(function () {
  var s = document.currentScript, key = s && s.dataset.key; if (!key) return;
  // relative to the script's own URL, so a site can serve both from its own domain (first-party proxy)
  var api = new URL("lease/" + encodeURIComponent(key), s.src).href, K = "cd-lease:" + key, PUB = "__PUB__";
  var b64 = function (t) { t = t.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(t + "===".slice((t.length + 3) % 4)), function (c) { return c.charCodeAt(0); }); };
  var get = function () { try { return localStorage.getItem(K) || ""; } catch (e) { return ""; } };
  var put = function (v) { try { localStorage.setItem(K, v); } catch (e) {} };
  // hide early if the stored lease already says off, so the site doesn't flash
  try { if (JSON.parse(new TextDecoder().decode(b64(get().split(".")[0]))).s === "off") document.documentElement.style.visibility = "hidden"; } catch (e) {}

  // fresh = straight from our server. Browsers that can't check Ed25519 (http pages, old browsers) trust only those.
  function verify(t, fresh) {
    var p = (t || "").split(".");
    if (p.length !== 2) return Promise.resolve(null);
    var check = window.crypto && crypto.subtle
      ? crypto.subtle.importKey("raw", b64(PUB), { name: "Ed25519" }, false, ["verify"]).then(
          function (k) { return crypto.subtle.verify("Ed25519", k, b64(p[1]), new TextEncoder().encode(p[0])); },
          function () { return !!fresh; })
      : Promise.resolve(!!fresh);
    return check.then(function (ok) {
        if (!ok) return null;
        var d = JSON.parse(new TextDecoder().decode(b64(p[0]))), h = location.hostname;
        if (d.k !== key) return null;
        if (d.d && h !== d.d && h.slice(-d.d.length - 1) !== "." + d.d && h !== "localhost") return null;
        return d;
      }).catch(function () { return null; });
  }
  var blocked = false;
  // The maintenance page designed in the CRM (license.page). Built with DOM calls and textContent only:
  // nothing from the lease is ever parsed as HTML. Keep in step with MaintenancePreview.tsx in the client.
  var HEX = /^#[0-9a-f]{6}$/i, LINK = /^(https:|mailto:|tel:)/;
  var color = function (v, f) { return HEX.test(v || "") ? v : f; };
  var ink = function (h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150 ? "#fff" : "#0d0d12"; };
  var el = function (tag, css, text) { var e = document.createElement(tag); e.style.cssText = css; if (text) e.textContent = text; return e; };
  function block(d) {
    blocked = true;
    var p = (d && d.p) || {}, bg = color(p.bg, "#f2f1ed"), fg = color(p.fg, "#0d0d12"), ac = color(p.ac, "#2b3bff");
    var show = function () {
      document.documentElement.style.visibility = "visible";
      var page = el("div", "position:fixed;inset:0;display:grid;place-items:center;background:" + bg + ";color:" + fg + ";font:16px/1.5 system-ui,sans-serif;padding:24px;text-align:center;z-index:2147483647");
      var box = el("div", "max-width:440px;display:grid;justify-items:center;gap:14px;overflow-wrap:anywhere");
      if (p.l) { var img = el("img", "max-height:64px;max-width:200px;object-fit:contain;margin-bottom:8px"); img.alt = ""; img.src = new URL(p.l, new URL(s.src).origin).href; box.appendChild(img); }
      box.appendChild(el("h1", "font-size:32px;font-weight:500;letter-spacing:-.03em;line-height:1.1;margin:0", p.h || "Temporarily unavailable"));
      box.appendChild(el("p", "margin:0;opacity:.7", (d && d.m) || "This website is under maintenance. Please check back soon."));
      if (p.bl && LINK.test(p.bu || "")) {
        var a = el("a", "margin-top:8px;padding:12px 22px;border-radius:99px;background:" + ac + ";color:" + ink(ac) + ";text-decoration:none;font-weight:500", p.bl);
        a.href = p.bu; a.rel = "noopener";
        box.appendChild(a);
      }
      page.appendChild(box);
      document.body.replaceChildren(page);
    };
    document.body ? show() : addEventListener("DOMContentLoaded", show);
  }
  // switched back on while blocked: reload to bring the real page back
  function apply(d) { if (d && d.s === "off") block(d); else if (blocked) location.reload(); else document.documentElement.style.visibility = "visible"; }

  verify(get()).then(function (cur) {
    var now = Date.now();
    if (cur) apply(cur); else document.documentElement.style.visibility = "visible";
    // renew at most every 10 minutes; a switched off license reaches open sites on their next renewal
    if (cur && cur.s === "on" && now - cur.iat < 6e5) return;
    fetch(api, { cache: "no-store" })
      .then(function (r) {
        if (r.status === 404) { try { localStorage.removeItem(K); } catch (e) {} return block(null); } // key deleted or replaced
        return r.json().then(function (j) {
          var t = j && j.data && j.data.lease;
          return verify(t, true).then(function (d) { if (!d) throw 0; put(t); apply(d); });
        });
      })
      // our server unreachable: keep running until the stored lease runs out
      .catch(function () { if (cur && cur.exp < now) block(cur); });
  });
})();`;

// exporting the router
export default router;
