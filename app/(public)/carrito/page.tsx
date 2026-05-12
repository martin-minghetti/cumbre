import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Route } from 'next';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { packDefinitions, products } from '@/db/schema';
import { verifyCart } from '@/lib/cart';
import { CartLine } from '@/components/public/CartLine';
import { fmtFormat } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function CarritoPage() {
  const store = await cookies();
  const token = store.get('cart')?.value;
  const cart = token ? await verifyCart(token) : null;
  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-9 pt-32 pb-40 text-text-inverse">
        <h1 className="font-display text-[clamp(60px,10vw,120px)] uppercase leading-[0.88] tracking-[-0.01em]">
          Carrito
        </h1>
        <p className="mt-6 font-body text-lg italic text-muted">Tu carrito está vacío.</p>
        <Link
          href={'/cervezas' as Route}
          className="mt-8 inline-block border border-line-strong px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-inverse transition hover:border-accent hover:text-accent"
        >
          Ver cervezas →
        </Link>
      </main>
    );
  }

  const packIds = lines.map((l) => l.packId);
  const packs = await db
    .select({
      id: packDefinitions.id,
      size: packDefinitions.size,
      priceCents: packDefinitions.priceCents,
      sku: packDefinitions.sku,
      productId: packDefinitions.productId,
      productName: products.name,
      format: products.format,
    })
    .from(packDefinitions)
    .innerJoin(products, eq(packDefinitions.productId, products.id))
    .where(inArray(packDefinitions.id, packIds));

  const packMap = new Map(packs.map((p) => [p.id, p]));

  const rows = lines
    .map((l) => {
      const p = packMap.get(l.packId);
      if (!p) return null;
      return {
        packId: l.packId,
        qty: l.qty,
        unitPriceCents: p.priceCents,
        lineTotalCents: p.priceCents * l.qty,
        productName: p.productName,
        packLabel: p.size === 1 ? `Unidad · ${fmtFormat(p.format)}` : `Pack ${p.size} · ${fmtFormat(p.format)}`,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const subtotal = rows.reduce((s, r) => s + r.lineTotalCents, 0);

  return (
    <main className="mx-auto max-w-4xl px-9 pt-32 pb-40 text-text-inverse">
      <header className="border-b border-line pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— tu carrito</p>
        <h1 className="mt-2 font-display text-[clamp(60px,10vw,120px)] uppercase leading-[0.88] tracking-[-0.01em]">
          Carrito
        </h1>
      </header>

      <section className="mt-8">
        {rows.map((r) => (
          <CartLine key={r.packId} {...r} />
        ))}
      </section>

      <section className="mt-12 flex items-end justify-between border-t border-line-strong pt-8">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">Subtotal</div>
          <div className="font-mono text-[10px] text-muted">Envío se calcula en checkout</div>
        </div>
        <div className="font-display text-[64px] leading-[1] tracking-[0.005em] text-accent">
          ${(subtotal / 100).toLocaleString('es-AR')}
        </div>
      </section>

      <div className="mt-10 flex justify-end gap-4">
        <Link
          href={'/cervezas' as Route}
          className="border border-line-strong px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-inverse transition hover:border-accent hover:text-accent"
        >
          ← seguir comprando
        </Link>
        <Link
          href={'/checkout' as Route}
          className="bg-accent px-8 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bg transition hover:bg-paper"
        >
          ir al checkout →
        </Link>
      </div>
    </main>
  );
}
