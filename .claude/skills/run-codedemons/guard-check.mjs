// Checks the license guard (fullstack) and first-party script against a running test stack:
//   node driver.mjs up      (in another terminal)
//   node guard-check.mjs
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const driverDir = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.resolve(driverDir, '../../../server')
const scratch = mkdtempSync(path.join(tmpdir(), 'cd-guard-'))
const { default: express } = await import(pathToFileURL(path.join(serverDir, 'node_modules/express/index.js')).href)
const { chromium } = await import(pathToFileURL(path.join(driverDir, 'node_modules/playwright-core/index.mjs')).href)
const API = 'http://localhost:5055/api'
let fails = 0
const check = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? '  (' + x + ')' : ''}`); if (!ok) fails++ }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let token
const call = async (method, p, body) => {
  const r = await fetch(API + p, { method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
  return (await r.json()).data
}
token = (await call('POST', '/admin/login', { email: 'admin@test.local', password: 'driver-password-123' })).token
const id = (await call('POST', '/admin/clients', { name: 'Fullstack Client', email: 'fs@test.local' }))._id
const key = (await call('POST', `/admin/clients/${id}/license`)).license.key
await call('PUT', `/admin/clients/${id}`, { license: { message: 'Down for <b>upgrades</b>', page: { heading: '<script>alert(1)</script>Back soon', logo: '', bg: '#14141f', fg: '#f5f3ee', accent: '#ffd23f', buttonLabel: 'Email us', buttonUrl: 'mailto:a@b.co' } } })

// 1. download the guard exactly as a client would
const src = await (await fetch(API + '/license/guard.mjs')).text()
check('guard.mjs has our public key and API baked in', !src.includes('__PUB__') && src.includes('/api/license'))
const file = path.join(scratch, 'license-guard.mjs'); writeFileSync(file, src)
const { licenseGuard } = await import(pathToFileURL(file).href)

// a client's fullstack app
const listen = (app) => new Promise((r) => { const s = app.listen(0, () => r(s)) })
const appWith = (guard) => { const a = express(); a.use(guard); a.get('/', (q, s) => s.send('REAL PAGE')); a.get('/api/orders', (q, s) => s.json({ orders: [1, 2] })); return a }
const get = async (srv, p, accept = 'text/html') => { const r = await fetch(`http://localhost:${srv.address().port}${p}`, { headers: { accept } }); return { s: r.status, t: await r.text() } }

const appSrv = await listen(appWith(licenseGuard({ key, api: API + '/license', refreshMs: 300 })))
let r = await get(appSrv, '/')
check('license on: real app runs', r.s === 200 && r.t === 'REAL PAGE')

await call('PUT', `/admin/clients/${id}`, { license: { on: false } })
await sleep(400); await get(appSrv, '/'); await sleep(300) // stale -> renews in the background
r = await get(appSrv, '/')
check('switched off: 503 maintenance page, real page never sent', r.s === 503 && !r.t.includes('REAL PAGE') && r.t.includes('Back soon'))
check('heading/message HTML is escaped, not markup', !r.t.includes('<script>alert') && r.t.includes('&#60;script&#62;') && r.t.includes('&#60;b&#62;upgrades'))
check('custom colours + button rendered', r.t.includes('#14141f') && r.t.includes('href="mailto:a@b.co"'))
r = await get(appSrv, '/api/orders', 'application/json')
check('API calls get 503 JSON, no data', r.s === 503 && JSON.parse(r.t).message === 'Down for <b>upgrades</b>' && !r.t.includes('orders'))

// edge / fetch-style frameworks (Next.js middleware, Workers, Hono...) use respond(request)
const edge = licenseGuard({ key, api: API + '/license' })
let resp = await edge.respond(new Request('https://client.test/', { headers: { accept: 'text/html' } }))
check('edge respond(): 503 Response with the maintenance page', resp?.status === 503 && (await resp.text()).includes('Back soon'))
resp = await edge.respond(new Request('https://client.test/api/orders', { headers: { accept: 'application/json' } }))
check('edge respond(): 503 JSON for API calls', resp?.status === 503 && JSON.parse(await resp.text()).success === false)

await call('PUT', `/admin/clients/${id}`, { license: { on: true } })
const edgeOn = licenseGuard({ key, api: API + '/license' })
check('edge respond(): null (let the app run) when on', (await edgeOn.respond(new Request('https://client.test/'))) === null)
await sleep(31000); await get(appSrv, '/'); await sleep(500) // a down site re-checks every 30s
r = await get(appSrv, '/')
check('switched back on: real app again within ~30s', r.s === 200 && r.t === 'REAL PAGE')

// 2. forged lease: a fake codedemons signs nothing valid -> ignored (fails open, can't take a site down)
const real = (await call('GET', `/license/lease/${key}`)).lease
const forged = Buffer.from(JSON.stringify({ k: key, s: 'off', m: 'pwned', iat: Date.now(), exp: Date.now() + 1e9 })).toString('base64url') + '.' + real.split('.')[1]
const fake = await listen(express().get('/license/lease/:k', (q, s) => s.json({ success: true, data: { lease: forged } })))
const forgedSrv = await listen(appWith(licenseGuard({ key, api: `http://localhost:${fake.address().port}/license` })))
r = await get(forgedSrv, '/')
check('forged "off" lease rejected (signature check)', r.s === 200 && r.t === 'REAL PAGE')

// 3. our server down after a good "off" lease: the site stays down (last verified lease kept)
await call('PUT', `/admin/clients/${id}`, { license: { on: false } })
let up = true
const proxy = await listen(express().use(async (q, s) => { if (!up) return s.destroy(); const x = await fetch(API + q.url.replace(/^\/p/, '')); s.status(x.status).type('json').send(await x.text()) }))
const outageSrv = await listen(appWith(licenseGuard({ key, api: `http://localhost:${proxy.address().port}/p/license`, refreshMs: 300 })))
check('down via proxy', (await get(outageSrv, '/')).s === 503)
up = false; await sleep(400)
check('codedemons unreachable: stays down on the stored lease', (await get(outageSrv, '/')).s === 503)

// 4. key replaced in the CRM: old key -> down
await call('PUT', `/admin/clients/${id}`, { license: { on: true } })
const oldKeySrv = await listen(appWith(licenseGuard({ key, api: API + '/license' })))
check('fresh guard, license on', (await get(oldKeySrv, '/')).s === 200)
await call('POST', `/admin/clients/${id}/license`)
const oldKeySrv2 = await listen(appWith(licenseGuard({ key, api: API + '/license' })))
check('replaced key: old key -> maintenance', (await get(oldKeySrv2, '/')).s === 503)

// 5. browser script served first-party from the client's own domain (/cd/* proxied to /api/license/*)
const key2 = (await call('GET', `/admin/clients/${id}`)).license.key
await call('PUT', `/admin/clients/${id}`, { license: { on: false } })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage()
const seen = []
await page.route('http://localhost:5999/cd/**', async (route) => { seen.push(new URL(route.request().url()).pathname); route.fulfill({ response: await route.fetch({ url: route.request().url().replace('http://localhost:5999/cd/', API + '/license/') }) }) })
await page.route('http://localhost:5999/', (route) => route.fulfill({ contentType: 'text/html', body: `<html><head><script src="/cd/sdk.js" data-key="${key2}"></script></head><body><h1 id=real>REAL</h1></body></html>` }))
await page.goto('http://localhost:5999/'); await sleep(1500)
check('first-party script: lease fetched from the client domain', seen.includes(`/cd/lease/${key2}`), seen.join(' '))
check('first-party script: maintenance page shown', await page.locator('#real').count() === 0)
await browser.close()

for (const s of [appSrv, fake, forgedSrv, proxy, outageSrv, oldKeySrv, oldKeySrv2]) s.close()
console.log(fails ? `${fails} FAILED` : 'ALL PASSED')
process.exit(fails ? 1 : 0)
