import { MercadoPagoConfig, Preference } from 'mercadopago';
import { env } from '@/lib/env';
import { brand } from '@/config/brand';

export function isMpEnabled(): boolean {
  return env.PAYMENT_MODE === 'production' && Boolean(env.MP_ACCESS_TOKEN);
}

export async function createMpPreference(args: {
  orderId: number;
  items: { title: string; quantity: number; unitPriceCents: number }[];
  shippingCents: number;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}): Promise<string> {
  if (!isMpEnabled()) throw new Error('MP not configured');
  const client = new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN! });
  const pref = new Preference(client);

  const items = args.items.map((i, idx) => ({
    id: `${args.orderId}-${idx}`,
    title: i.title,
    quantity: i.quantity,
    currency_id: 'ARS',
    unit_price: i.unitPriceCents / 100,
  }));
  if (args.shippingCents > 0) {
    items.push({
      id: `${args.orderId}-shipping`,
      title: 'Envío',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: args.shippingCents / 100,
    });
  }

  const res = await pref.create({
    body: {
      items,
      payer: { email: args.customerEmail },
      external_reference: String(args.orderId),
      back_urls: {
        success: args.successUrl,
        failure: args.failureUrl,
        pending: args.pendingUrl,
      },
      auto_return: 'approved',
      statement_descriptor: brand.name.toUpperCase(),
      notification_url: `${publicBaseUrl()}/api/webhooks/mercadopago`,
    },
  });

  if (!res.init_point) throw new Error('MP preference missing init_point');
  return res.init_point;
}

function publicBaseUrl(): string {
  const v = process.env.VERCEL_URL;
  return v ? `https://${v}` : 'http://localhost:3000';
}
