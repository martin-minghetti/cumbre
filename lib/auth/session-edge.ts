/**
 * Edge-runtime-compatible session verifier.
 * Uses Web Crypto (crypto.subtle) instead of node:crypto so it can run in
 * Next.js middleware (Edge runtime). Verifies the same token format produced
 * by session.ts (HS256 base64url header.payload.signature).
 */

export type SessionPayload = {
  userId: number;
  role: 'owner' | 'cashier';
};

type SignedPayload = SessionPayload & { exp: number };

function base64UrlToBytes(b64: string): Uint8Array<ArrayBuffer> {
  // Pad to multiple of 4
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const b64padded = padded + '=='.slice(0, pad);
  const binary = atob(b64padded);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

export async function verifySessionEdge(token: string): Promise<SignedPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const keyMaterial = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const data = new TextEncoder().encode(`${header}.${body}`);
  const sigBytes = base64UrlToBytes(signature);
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
  if (!valid) return null;

  try {
    const decodedBody = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(decodedBody);
    if (!isValidPayload(payload) || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
