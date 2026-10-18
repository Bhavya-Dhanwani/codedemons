import crypto from 'node:crypto';
import { lease, licenseState, publicKey } from '../shared/utils/crm.util';
import { maintenancePage } from '../modules/public/license/license.page';

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

describe('maintenance page', () => {
  it('draws the canvas with every value escaped or checked', () => {
    const html = maintenancePage({ p: { c: { bg: '#112233', els: [
      { t: 'text', x: 0, y: 0, w: 640, h: 100, text: '<script>x</script>', size: 64, color: 'red;}body{' },
      { t: 'button', x: 0, y: 200, w: 200, h: 60, text: 'Mail', href: 'javascript:alert(1)' },
      { t: 'image', x: 0, y: 300, w: 200, h: 60, src: 'https://ik.imagekit.io/a.png" onerror="x' },
    ] } } });
    expect(html).toContain('&#60;script&#62;');
    expect(html).not.toContain('<script');
    expect(html).toContain('color:#0d0d12'); // bad colour falls back
    expect(html).not.toContain('javascript:'); // bad link renders as a plain label
    expect(html).not.toContain('onerror');
    expect(html).toContain('left:0%;top:0%;width:50%');
  });

  it('keeps pages designed before the canvas', () => {
    const html = maintenancePage({ m: 'Back on Monday', p: { h: 'Closed', bl: 'Email', bu: 'mailto:a@b.co', ac: '#000000' } });
    expect(html).toContain('Closed');
    expect(html).toContain('Back on Monday');
    expect(html).toContain('href="mailto:a@b.co"');
  });
});

describe('maintenance page styling', () => {
  it('draws gradients, borders, shadows, rotation and button images from checked values only', () => {
    const html = maintenancePage({ p: { c: { bg: '#000000', bg2: '#ffffff', bg3: '#ff0000', bgType: 'radial', els: [
      { t: 'button', x: 0, y: 0, w: 200, h: 60, text: 'Go', href: 'https://a.co', src: 'https://ik.imagekit.io/i.png', fill: '#111111', fill2: '#222222', fangle: 90, bw: 2, bc: 'x', shadow: 0.5, rot: 999 },
      { t: 'text', x: 0, y: 100, w: 200, h: 60, text: 'Hi', fill: '#111111', fill2: '#222222', clip: true },
    ] } } });
    expect(html).toContain('radial-gradient(circle at center,#000000,#ffffff,#ff0000)');
    expect(html).toContain('linear-gradient(90deg,#111111,#222222)');
    expect(html).toContain('solid #0d0d12'); // bad border colour falls back
    expect(html).toContain('rotate(180deg)'); // clamped
    expect(html).toContain('<img alt="" src="https://ik.imagekit.io/i.png"');
    expect(html).toContain('background-clip:text');
  });
});

describe('maintenance page phone layout', () => {
  it('uses each element phone box on tall screens and hides what is hidden there', () => {
    const base = { t: 'text', x: 0, y: 0, w: 640, h: 100, text: 'Hi', size: 64 };
    const html = maintenancePage({ p: { c: { bg: '#ffffff', mobile: true, els: [
      { ...base, m: { x: 39, y: 84.4, w: 312, h: 84.4, size: 30, hide: false } },
      { ...base, text: 'Desktop only', m: { x: 0, y: 0, w: 10, h: 10, size: 10, hide: true } },
    ] } } });
    expect(html).toMatch(/--mx:10%;--my:10[.0-9]*%;--mw:80%;--mh:10[.0-9]*%;--mfs:30/);
    expect(html).toContain('aspect-ratio:390/844');
    expect(html).toMatch(/class="cd-e cd-text cd-mh"[^>]*>Desktop only/);
    // no phone layout: the old single column
    expect(maintenancePage({ p: { c: { bg: '#ffffff', els: [base] } } })).toContain('flex-direction:column');
  });
});
