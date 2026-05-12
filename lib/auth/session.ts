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
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256' }));
  const fullPayload: SignedPayload = { ...payload, exp: Date.now() + SESSION_TTL_MS };
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
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
    const payload = JSON.parse(base64UrlDecode(body)) as SignedPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
