import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { env } from '@/lib/env';
import { applyOrderPaid } from '@/lib/order-paid';

const FRESHNESS_MS = 5 * 60_000;

export async function POST(req: NextRequest) {
  // MP can send `data.id` in body or query (`data.id` / `id`). Handle both.
  const url = new URL(req.url);
  const idFromQuery = url.searchParams.get('data.id') ?? url.searchParams.get('id');
  const requestId = req.headers.get('x-request-id') ?? '';
  const signatureHeader = req.headers.get('x-signature') ?? '';

  // Read body once (we may need both raw parsing and id extraction).
  const bodyText = await req.text().catch(() => '');
  let body: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = {};
  }

  // If a webhook secret is configured, verify signature. Otherwise accept (dev / simulated mode).
  if (env.MP_WEBHOOK_SECRET) {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => {
        const [k, v] = p.split('=');
        return [k?.trim() ?? '', (v ?? '').trim()];
      }),
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    if (!ts || !v1) {
      console.warn('[mp-webhook] missing signature parts');
      return NextResponse.json({ ok: false, reason: 'no_signature' }, { status: 200 });
    }
    const drift = Math.abs(Date.now() - Number(ts) * 1000);
    if (!Number.isFinite(Number(ts)) || drift > FRESHNESS_MS) {
      console.warn('[mp-webhook] stale ts', { drift });
      return NextResponse.json({ ok: false, reason: 'stale_ts' }, { status: 200 });
    }
    const id = idFromQuery ?? body.data?.id ?? '';
    const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
    const valid = await verifyMpSignature(manifest, v1, env.MP_WEBHOOK_SECRET);
    if (!valid) {
      console.warn('[mp-webhook] invalid signature');
      return NextResponse.json({ ok: false, reason: 'invalid_signature' }, { status: 200 });
    }
  }

  const type = body.type ?? body.action ?? '';

  // MP sends a few flavours: 'payment', 'payment.created', 'payment.updated', or action 'payment.created'.
  const isPaymentEvent = type === 'payment' || type.startsWith('payment.');
  if (!isPaymentEvent) {
    return NextResponse.json({ ok: true, skip: 'wrong_type' });
  }

  const paymentId = body.data?.id ?? idFromQuery;
  if (!paymentId) return NextResponse.json({ ok: true, skip: 'no_id' });

  if (!env.MP_ACCESS_TOKEN) {
    console.warn('[mp-webhook] no MP_ACCESS_TOKEN; cannot fetch payment');
    return NextResponse.json({ ok: true, skip: 'no_token' });
  }

  const client = new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN });
  const paymentApi = new Payment(client);
  const payment = await paymentApi.get({ id: paymentId }).catch((e) => {
    console.error('[mp-webhook] payment fetch failed:', e);
    return null;
  });
  if (!payment) return NextResponse.json({ ok: true, skip: 'payment_not_found' });

  const externalReference = payment.external_reference;
  const status = payment.status; // 'approved' | 'pending' | 'rejected' | etc.
  const orderId = externalReference ? Number(externalReference) : NaN;

  if (status !== 'approved' || !Number.isFinite(orderId)) {
    return NextResponse.json({ ok: true, skip: `status_${status}` });
  }

  const result = await applyOrderPaid({
    orderId,
    mpPaymentId: String(paymentId),
    paymentStatus: status,
  });
  return NextResponse.json({
    ok: true,
    applied: result.applied,
    cancelled: 'cancelled' in result ? result.cancelled ?? false : false,
  });
}

async function verifyMpSignature(manifest: string, expectedHex: string, secret: string): Promise<boolean> {
  const k = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(manifest));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Timing-safe compare via constant-time xor over byte codes.
  if (hex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}
