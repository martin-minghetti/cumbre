import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addLine, signCart, verifyCart, MAX_QTY_PER_LINE, type Cart } from '@/lib/cart';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const bodySchema = z.object({
  packId: z.number().int().positive(),
  qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit({ key: `cart:${clientIp(req)}`, limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const { packId, qty } = parsed.data;

  const current = req.cookies.get('cart')?.value;
  const cart: Cart = (current ? await verifyCart(current) : null) ?? { lines: [] };
  const next = addLine(cart, packId, qty);

  const token = await signCart(next);
  const res = NextResponse.json({ ok: true, totalQty: next.lines.reduce((s, l) => s + l.qty, 0) });
  res.cookies.set('cart', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
