import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { env } from '@/lib/env';
import { applyOrderPaid } from '@/lib/order-paid';
import { signOrderToken } from '@/lib/order-token';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const bodySchema = z.object({ decision: z.enum(['approve', 'reject']) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (env.PAYMENT_MODE !== 'simulated') {
    return NextResponse.json({ error: 'simulated_disabled' }, { status: 403 });
  }
  const rl = rateLimit({ key: `simulated:${clientIp(req)}`, limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { orderId: raw } = await params;
  const orderId = Number(raw);
  if (!Number.isFinite(orderId)) return NextResponse.json({ error: 'invalid_order' }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (order.status !== 'pending') return NextResponse.json({ error: 'not_pending' }, { status: 409 });

  if (parsed.data.decision === 'reject') {
    await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId));
    return NextResponse.json({ redirectUrl: '/carrito' });
  }

  const result = await applyOrderPaid({
    orderId,
    mpPaymentId: `simulated-${orderId}`,
    paymentStatus: 'approved',
  });

  if (result.applied || ('reason' in result && result.reason === 'already_applied')) {
    const token = await signOrderToken(orderId);
    return NextResponse.json({ redirectUrl: `/checkout/exito?token=${token}` });
  }
  return NextResponse.json({ redirectUrl: '/carrito', error: 'reason' in result ? result.reason : 'unknown' });
}
