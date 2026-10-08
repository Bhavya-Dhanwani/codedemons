import crypto from 'node:crypto';
import { lease, licenseState, publicKey } from '../shared/utils/crm.util';

const DAY = 864e5;
const now = Date.UTC(2026, 9, 7);
const base = { key: 'LIC-TEST', on: true, graceDays: 7, domain: 'client.com', message: 'Back soon' };

// what the website does: check our signature with the public key, then read the payload
const open = (t: string) => {
  const [body, sig] = t.split('.');
  const key = crypto.createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: publicKey }, format: 'jwk' });
  expect(crypto.verify(null, Buffer.from(body), key, Buffer.from(sig, 'base64url'))).toBe(true);
  return JSON.parse(Buffer.from(body, 'base64url').toString());
};

describe('license', () => {
  it('moves active -> grace -> expired as payment lapses, and the switch overrides', () => {
    const paidUntil = new Date(now);
    expect(licenseState({ ...base, paidUntil }, now - DAY)).toBe('active');
    expect(licenseState({ ...base, paidUntil }, now + 3 * DAY)).toBe('grace');
    expect(licenseState({ ...base, paidUntil }, now + 8 * DAY)).toBe('expired');
    expect(licenseState({ ...base, paidUntil: null, on: false }, now)).toBe('off');
    expect(licenseState({ ...base, key: '' }, now)).toBe('none');
  });

  it('signs leases the website can verify, ending at the grace deadline', () => {
    const on = open(lease({ ...base, paidUntil: new Date(now + DAY) }, now));
    expect(on).toMatchObject({ k: 'LIC-TEST', d: 'client.com', s: 'on', m: '' });
    expect(on.exp).toBe(now + 7 * DAY); // capped at 7 days

    const late = open(lease({ ...base, paidUntil: new Date(now - 5 * DAY) }, now));
    expect(late.exp).toBe(now + 2 * DAY); // grace ends 2 days from now

    const off = open(lease({ ...base, paidUntil: null, on: false }, now));
    expect(off).toMatchObject({ s: 'off', m: 'Back soon' });
  });

  it('rejects a tampered lease', () => {
    const [body, sig] = lease({ ...base, paidUntil: null, on: false }, now).split('.');
    const forged = Buffer.from(Buffer.from(body, 'base64url').toString().replace('"off"', '"on"')).toString('base64url');
    const key = crypto.createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: publicKey }, format: 'jwk' });
    expect(crypto.verify(null, Buffer.from(forged), key, Buffer.from(sig, 'base64url'))).toBe(false);
  });
});
