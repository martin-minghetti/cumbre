import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { packDefinitions, products } from '@/db/schema';
import { verifyCart } from '@/lib/cart';
import { getShippingOptions } from '@/lib/shipping';
import { fmtFormat } from '@/lib/products';
import { env } from '@/lib/env';
import { CheckoutForm } from '@/components/public/CheckoutForm';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const store = await cookies();
  const token = store.get('cart')?.value;
  const cart = token ? await verifyCart(token) : null;
  const lines = cart?.lines ?? [];

  if (lines.length === 0) redirect('/carrito' as Route);

  const packs = await db
    .select({
      id: packDefinitions.id,
      size: packDefinitions.size,
      priceCents: packDefinitions.priceCents,
      productName: products.name,
      format: products.format,
    })
    .from(packDefinitions)
    .innerJoin(products, eq(packDefinitions.productId, products.id))
    .where(inArray(packDefinitions.id, lines.map((l) => l.packId)));

  const packMap = new Map(packs.map((p) => [p.id, p]));
  const items = lines
    .map((l) => {
      const p = packMap.get(l.packId);
      if (!p) return null;
      return {
        packId: l.packId,
        qty: l.qty,
        unitPriceCents: p.priceCents,
        productName: p.productName,
        packLabel: p.size === 1 ? `Unidad · ${fmtFormat(p.format)}` : `Pack ${p.size} · ${fmtFormat(p.format)}`,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const shippingOptions = getShippingOptions();

  return (
    <main className="mx-auto max-w-6xl px-9 pt-32 pb-40 text-text-inverse">
      <header className="mb-12 border-b border-line pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— checkout</p>
        <h1 className="mt-2 font-display text-[clamp(60px,10vw,120px)] uppercase leading-[0.88] tracking-[-0.01em]">
          Cerrar tu pedido
        </h1>
        <Link
          href={'/carrito' as Route}
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-accent"
        >
          ← volver al carrito
        </Link>
      </header>

      <CheckoutForm items={items} shippingOptions={shippingOptions} paymentMode={env.PAYMENT_MODE} />
    </main>
  );
}
