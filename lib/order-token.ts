import { env } from '@/lib/env';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function b64uEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64uDecode(b: string): string {
  const padded = b.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '=='.slice(0, pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function bytesToB64u(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64uToBytes(b: string): Uint8Array<ArrayBuffer> {
  const padded = b.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '=='.slice(0, pad));
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function key(usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ORDER_TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

export async function signOrderToken(orderId: number, ttlMsOverride?: number): Promise<string> {
  const header = b64uEncode(JSON.stringify({ alg: 'HS256' }));
  const ttl = ttlMsOverride ?? TOKEN_TTL_MS;
  const payload = { orderId, exp: Date.now() + ttl };
  const body = b64uEncode(JSON.stringify(payload));
  const k = await key('sign');
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${bytesToB64u(sig)}`;
}

export async function verifyOrderToken(token: string): Promise<number | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  try {
    const k = await key('verify');
    const ok = await crypto.subtle.verify(
      'HMAC',
      k,
      b64uToBytes(sig),
      new TextEncoder().encode(`${header}.${body}`),
    );
    if (!ok) return null;
    const payload = JSON.parse(b64uDecode(body));
    if (typeof payload?.orderId !== 'number') return null;
    if (typeof payload?.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload.orderId;
  } catch {
    return null;
  }
}
