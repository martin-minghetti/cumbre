import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { customers, orderItems, orders, packDefinitions, products } from '@/db/schema';
import { verifyOrderToken } from '@/lib/order-token';
import { fmtFormat, fmtPrice } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function CheckoutExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) notFound();
  const orderId = await verifyOrderToken(token);
  if (!orderId) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();
  if (order.status !== 'paid' && order.status !== 'fulfilled') notFound();

  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1);
  const items = await db
    .select({
      qty: orderItems.qty,
      unitPriceCents: orderItems.unitPriceCents,
      lineTotalCents: orderItems.lineTotalCents,
      productName: products.name,
      packSize: packDefinitions.size,
      format: products.format,
    })
    .from(orderItems)
    .innerJoin(packDefinitions, eq(orderItems.packDefinitionId, packDefinitions.id))
    .innerJoin(products, eq(packDefinitions.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return (
    <main className="mx-auto max-w-3xl px-9 pt-32 pb-40 text-text-inverse">
      <div className="border border-accent/40 p-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">✓ pago confirmado</p>
        <h1 className="mt-4 font-display text-[clamp(48px,8vw,96px)] uppercase leading-[0.88] tracking-[-0.01em]">
          ¡Gracias{customer ? `, ${customer.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="mt-6 font-body text-lg text-text-inverse/80">
          Recibimos tu pedido <span className="font-mono text-accent">#{order.id}</span>. Te mandamos un mail con el detalle.
        </p>

        <section className="mt-10 border-t border-line pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Tu pedido</p>
          <ul className="mt-4 space-y-3">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-start justify-between font-mono text-sm">
                <span className="text-text-inverse">
                  {it.qty}× {it.productName}
                  <br />
                  <span className="text-muted">
                    {it.packSize === 1
                      ? `unidad · ${fmtFormat(it.format as 'lata_473' | 'porron_1l')}`
                      : `pack ${it.packSize} · ${fmtFormat(it.format as 'lata_473' | 'porron_1l')}`}
                  </span>
                </span>
                <span className="text-text-inverse">{fmtPrice(it.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-2 border-t border-line pt-6 font-mono text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{fmtPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Envío</span>
            <span>{order.shippingCostCents === 0 ? 'Gratis' : fmtPrice(order.shippingCostCents)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-2xl">
            <span>Total</span>
            <span className="text-accent">{fmtPrice(order.totalCents)}</span>
          </div>
        </section>

        <div className="mt-10 flex justify-end">
          <Link
            href={'/cervezas' as Route}
            className="bg-accent px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-bg transition hover:bg-paper"
          >
            seguir explorando →
          </Link>
        </div>
      </div>
    </main>
  );
}
