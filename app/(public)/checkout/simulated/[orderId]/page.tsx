import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { SimulatedPaymentPanel } from '@/components/public/SimulatedPaymentPanel';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function SimulatedPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  if (env.PAYMENT_MODE !== 'simulated') notFound();

  const { orderId: raw } = await params;
  const orderId = Number(raw);
  if (!Number.isFinite(orderId)) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();
  if (order.status !== 'pending') notFound();

  return (
    <main className="mx-auto max-w-2xl px-9 pt-32 pb-40 text-text-inverse">
      <div className="border border-line p-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">— pago simulado</p>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] uppercase leading-[0.92] tracking-[-0.01em]">
          Demo — sin Mercado Pago real
        </h1>
        <p className="mt-6 font-body text-text-inverse/80">
          Este flujo simula la respuesta de Mercado Pago para que puedas ver cómo termina el pedido.
          En producción, esta pantalla está reemplazada por el checkout real de Mercado Pago.
        </p>
        <div className="mt-8 border-t border-line pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Pedido</p>
          <div className="mt-2 font-display text-[48px] leading-[1]">#{order.id}</div>
          <p className="mt-1 font-mono text-sm text-muted">
            Total: ${(order.totalCents / 100).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="mt-10">
          <SimulatedPaymentPanel orderId={order.id} />
        </div>
      </div>
    </main>
  );
}
