import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCart, signCart } from '@/lib/cart';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { startCheckout } from '@/lib/checkout-start';

const bodySchema = z.object({
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(64),
  }),
  shippingMethod: z.enum(['delivery_local', 'pickup']),
  zoneName: z.string().optional(),
  shippingAddress: z.object({ street: z.string().min(1), city: z.string().min(1) }).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit({ key: `checkout:${clientIp(req)}`, limit: 10, windowMs: 5 * 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const body = parsed.data;
  if (body.shippingMethod === 'delivery_local') {
    if (!body.zoneName || !body.shippingAddress) {
      return NextResponse.json({ error: 'missing_address_or_zone' }, { status: 400 });
    }
  }

  const cartToken = req.cookies.get('cart')?.value;
  const cart = cartToken ? await verifyCart(cartToken) : null;
  if (!cart || cart.lines.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  try {
    const { orderId, redirectUrl } = await startCheckout({
      cart,
      customer: body.customer,
      shippingMethod: body.shippingMethod,
      zoneName: body.zoneName,
      shippingAddress: body.shippingAddress ?? null,
    });

    // Clear cart cookie on successful order creation
    const emptyToken = await signCart({ lines: [] });
    const res = NextResponse.json({ orderId, redirectUrl });
    res.cookies.set('cart', emptyToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error';
    if (msg === 'insufficient_stock' || msg === 'invalid_pack' || msg === 'empty_cart') {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('[checkout/start] error:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
