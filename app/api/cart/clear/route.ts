import { NextRequest, NextResponse } from 'next/server';
import { signCart } from '@/lib/cart';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const rl = rateLimit({ key: `cart:${clientIp(req)}`, limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const token = await signCart({ lines: [] });
  const res = NextResponse.json({ ok: true, totalQty: 0 });
  res.cookies.set('cart', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
