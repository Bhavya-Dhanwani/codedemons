// License settings by key, so the lease endpoint (hit by every client website) usually skips the database.
// What's cached is the settings, not a signed lease: the status (active / grace / expired / off) is worked
// out with the current time on every request, so due dates still take effect on time.
// Entries are dropped the moment their client is saved or deleted (hooks in client.model.ts), so the switch,
// a new key or a paid invoice reach websites immediately. The TTL is only a safety net.
// ponytail: in-memory per process; if the API ever runs as several instances, a save on one won't clear
// the others' caches; use Redis pub/sub then, or drop the cache.
import type { lease } from "./crm.util.js";

type LicenseData = Parameters<typeof lease>[0];
type Entry = { clientId: string; license: LicenseData; at: number };

const TTL_MS = 3 * 864e5;
const cache = new Map<string, Entry>();
// bumped on every client write; a database read that overlapped a write isn't cached (it may be stale)
let generation = 0;

export function cachedLicense(key: string) {
    const e = cache.get(key);
    if (e && Date.now() - e.at > TTL_MS) cache.delete(key);
    else if (e) return e.license;
}

/** Call before reading the database; pass the result to rememberLicense. */
export const readStarted = () => generation;

export function rememberLicense(key: string, clientId: string, license: LicenseData, startedAt: number) {
    if (startedAt === generation) cache.set(key, { clientId, license, at: Date.now() });
}

export function forgetClient(clientId: string) {
    generation++;
    for (const [key, e] of cache) if (e.clientId === clientId) cache.delete(key);
}
