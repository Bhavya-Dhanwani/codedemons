// Boots an isolated codedemons stack (in-memory Mongo + seeded projects + API + Vite) and drives it.
//   node driver.mjs smoke [extra paths...]  -> API checks + screenshots + admin login, then shuts down
//   node driver.mjs up                      -> same stack, stays running until Ctrl-C
// Env: HEADED=1 (visible browser), API_PORT (5055), WEB_PORT (5174), PW_CHANNEL (msedge on Windows, chrome elsewhere; "none" = bundled chromium)
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "client");
const shotsDir = path.join(here, "shots");
const API_PORT = Number(process.env.API_PORT || 5055);
const WEB_PORT = Number(process.env.WEB_PORT || 5174);
const API = `http://localhost:${API_PORT}`;
const WEB = `http://localhost:${WEB_PORT}`;
const ADMIN = { email: "admin@test.local", password: "driver-password-123" };
const [cmd = "smoke", ...extraPaths] = process.argv.slice(2);

const log = (...a) => console.log("[driver]", ...a);
const children = [];
let mongo, vite, browser;

function run(args, env, { wait } = {}) {
    // `node --import tsx` instead of npx: no shell, so killing the pid actually kills the server
    const p = spawn(process.execPath, ["--import", "tsx", ...args], { cwd: serverDir, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    // portal login codes are only logged when mail is off; echo them so a flow can use one
    p.stdout.on("data", (d) => { out.push(d); for (const m of String(d).match(/\[Portal\][^\n"\x1b]*/g) ?? []) log(m); });
    p.stderr.on("data", (d) => out.push(d));
    if (!wait) return children.push(p), Object.assign(p, { out });
    return new Promise((res, rej) => p.on("exit", (c) => (c ? rej(new Error(`${args.join(" ")} exited ${c}\n${Buffer.concat(out)}`)) : res(String(Buffer.concat(out))))));
}

async function waitFor(url, ms = 60000) {
    for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 500))) {
        try { if ((await fetch(url)).ok) return; } catch {}
    }
    throw new Error(`timed out waiting for ${url}`);
}

async function up() {
    mongo = await MongoMemoryServer.create();
    const env = {
        MONGO_URI: mongo.getUri("codedemons"), PORT: String(API_PORT), NODE_ENV: "development",
        ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: ADMIN.password, SEND_MAIL: "false", CORS_ORIGIN: "*",
        // no ImageKit keys: the test stack can never write to the real ImageKit account (uploads answer 503)
        IMAGEKIT_PUBLIC_KEY: "", IMAGEKIT_PRIVATE_KEY: "", IMAGEKIT_URL_ENDPOINT: "",
    };
    log("mongo", env.MONGO_URI);
    log((await run(["src/seed.ts"], env, { wait: true })).trim());
    const api = run(["server.ts"], env);
    await waitFor(`${API}/api/health`).catch((e) => { throw new Error(`${e.message}\n${Buffer.concat(api.out)}`); });
    log("api", API);

    // Vite's proxy is hardcoded to :5000 in vite.config.ts; override it here instead of editing the repo
    // logLevel silent: Vite 8 echoes every browser console line to the terminal; page errors are collected in smoke() instead
    const { createServer } = await import(pathToFileURL(path.join(clientDir, "node_modules/vite/dist/node/index.js")).href);
    vite = await createServer({ root: clientDir, logLevel: "silent", server: { port: WEB_PORT, strictPort: true, proxy: { "/api": API, "/uploads": API } } });
    await vite.listen();
    log("web", WEB);
}

async function down() {
    await browser?.close(); // an open browser keeps node alive forever after a failure
    for (const p of children) p.kill();
    await vite?.close();
    await mongo?.stop();
}

async function smoke() {
    const j = async (p, init) => { const r = await fetch(API + p, init); return { status: r.status, body: await r.json() }; };
    const projects = await j("/api/projects");
    log("GET /api/projects", projects.status, projects.body.data.map((p) => p.slug).join(","));
    log("GET /api/projects/nope", (await j("/api/projects/nope")).status);
    log("POST /api/admin/login (bad)", (await j("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: ADMIN.email, password: "x" }) })).status);

    const { chromium } = await import("playwright-core");
    const channel = process.env.PW_CHANNEL || (process.platform === "win32" ? "msedge" : "chrome");
    browser = await chromium.launch({ headless: !process.env.HEADED, ...(channel === "none" ? {} : { channel }) });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    mkdirSync(shotsDir, { recursive: true });

    const shot = async (name) => { const f = path.join(shotsDir, `${name}.png`); await page.screenshot({ path: f }); log("shot", f); };
    for (const p of ["/", "/work", `/work/${projects.body.data[0].slug}`, ...extraPaths]) {
        await page.goto(WEB + p); // not "networkidle": home streams video/3D assets and can stay busy past 30s
        await page.waitForTimeout(p === "/" ? 4000 : 2000); // home plays a ~2.7s preloader, then GSAP intros
        await shot(p === "/" ? "home" : p.slice(1).replaceAll("/", "_"));
    }

    // real user flow: admin login -> project list
    await page.goto(`${WEB}/admin`);
    await page.fill('input[type="email"]', ADMIN.email);
    await page.fill('input[type="password"]', ADMIN.password);
    await page.click("button:has-text('Log in')");
    await page.getByRole("button", { name: "Log out" }).waitFor();
    await page.getByRole("link", { name: "Projects" }).click(); // admin opens on Clients; tabs are router links
    await page.waitForTimeout(1000);
    log("admin rows with Edit buttons:", await page.getByRole("button", { name: "Edit" }).count());
    await shot("admin");

    if (errors.length) log("browser errors:\n  " + [...new Set(errors.map((e) => e.split("\n")[0].slice(0, 200)))].join("\n  "));
}

try {
    await up();
    if (cmd === "up") {
        log(`running. admin login: ${ADMIN.email} / ${ADMIN.password}. Ctrl-C to stop.`);
        process.on("SIGINT", () => down().then(() => process.exit(0)));
        await new Promise(() => {});
    }
    await smoke();
    log("OK");
} catch (e) {
    console.error("[driver] FAILED:", e);
    process.exitCode = 1;
} finally {
    if (cmd !== "up") await down();
}
