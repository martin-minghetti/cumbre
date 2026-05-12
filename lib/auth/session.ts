import { env } from '@/lib/env';

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type SessionPayload = {
  userId: number;
  role: 'owner' | 'cashier';
};

type SignedPayload = SessionPayload & { exp: number };

// Web Crypto-based HMAC so the same impl runs in Node (API routes) and Edge (middleware).
// Both signSession and verifySession are async; callers must await.

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '=='.slice(0, pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '=='.slice(0, pad));
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

function isValidPayload(p: unknown): p is SignedPayload {
  if (typeof p !== 'object' || p === null) return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.userId === 'number' &&
    (obj.role === 'owner' || obj.role === 'cashier') &&
    typeof obj.exp === 'number'
  );
}

export async function signSession(payload: SessionPayload): Promise<string> {
  // Header is JWT-shaped and included in the signature input, but we never read it back
  // on verify — this impl only ever produces and verifies HS256. The decorative header
  // keeps the token format JWT-compatible for future debugging tools.
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256' }));
  const fullPayload: SignedPayload = { ...payload, exp: Date.now() + SESSION_TTL_MS };
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const key = await getKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${bytesToBase64Url(sig)}`;
}

export async function verifySession(token: string): Promise<SignedPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const key = await getKey('verify');
  const sigBytes = base64UrlToBytes(signature);
  const data = new TextEncoder().encode(`${header}.${body}`);
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
  if (!valid) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!isValidPayload(payload) || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
