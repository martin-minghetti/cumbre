import { env } from '@/lib/env';

export const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const MAX_QTY_PER_LINE = 99;

export type CartLine = { packId: number; qty: number };
export type Cart = { lines: CartLine[] };

type SignedCart = Cart & { exp: number };

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
    new TextEncoder().encode(env.CART_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

function isValidCartPayload(p: unknown): p is SignedCart {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (typeof o.exp !== 'number') return false;
  if (!Array.isArray(o.lines)) return false;
  for (const l of o.lines) {
    if (typeof l !== 'object' || l === null) return false;
    const ll = l as Record<string, unknown>;
    if (typeof ll.packId !== 'number') return false;
    if (typeof ll.qty !== 'number' || ll.qty < 1) return false;
  }
  return true;
}

export async function signCart(cart: Cart, ttlMsOverride?: number): Promise<string> {
  const header = b64uEncode(JSON.stringify({ alg: 'HS256' }));
  const ttl = ttlMsOverride ?? CART_TTL_MS;
  const payload: SignedCart = { lines: cart.lines, exp: Date.now() + ttl };
  const body = b64uEncode(JSON.stringify(payload));
  const k = await key('sign');
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${bytesToB64u(sig)}`;
}

export async function verifyCart(token: string): Promise<Cart | null> {
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
    if (!isValidCartPayload(payload) || payload.exp < Date.now()) return null;
    return { lines: payload.lines };
  } catch {
    return null;
  }
}

export function addLine(cart: Cart, packId: number, qty: number): Cart {
  if (qty <= 0) return cart;
  const out = cart.lines.map((l) => ({ ...l }));
  const idx = out.findIndex((l) => l.packId === packId);
  if (idx === -1) {
    out.push({ packId, qty: Math.min(qty, MAX_QTY_PER_LINE) });
  } else {
    out[idx].qty = Math.min(out[idx].qty + qty, MAX_QTY_PER_LINE);
  }
  return { lines: out };
}

export function updateQty(cart: Cart, packId: number, qty: number): Cart {
  if (qty <= 0) return removeLine(cart, packId);
  const clamped = Math.min(qty, MAX_QTY_PER_LINE);
  return {
    lines: cart.lines.map((l) => (l.packId === packId ? { ...l, qty: clamped } : l)),
  };
}

export function removeLine(cart: Cart, packId: number): Cart {
  return { lines: cart.lines.filter((l) => l.packId !== packId) };
}

export function clear(): Cart {
  return { lines: [] };
}

export function totalQty(cart: Cart): number {
  return cart.lines.reduce((s, l) => s + l.qty, 0);
}
