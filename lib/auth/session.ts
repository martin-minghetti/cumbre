import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type SessionPayload = {
  userId: number;
  role: 'owner' | 'cashier';
};

type SignedPayload = SessionPayload & { exp: number };

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string): string {
  return createHmac('sha256', env.SESSION_SECRET).update(data).digest('base64url');
}

export function signSession(payload: SessionPayload): string {
  // Header is JWT-shaped and included in the signature input, but we never read it back
  // on verify — this impl only ever produces and verifies HS256. The decorative header
  // keeps the token format JWT-compatible for future debugging tools.
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256' }));
  const fullPayload: SignedPayload = { ...payload, exp: Date.now() + SESSION_TTL_MS };
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
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

export function verifySession(token: string): SignedPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expected = sign(`${header}.${body}`);
  const a = Buffer.from(signature, 'base64url');
  const b = Buffer.from(expected, 'base64url');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!isValidPayload(payload) || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
