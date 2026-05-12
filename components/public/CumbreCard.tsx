import Link from 'next/link';
import type { Route } from 'next';
import { type ProductWithExtras, fmtAbv, fmtFormat, fmtPrice } from '@/lib/products';

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="text-[13px]">{value}</dd>
    </div>
  );
}

export function CumbreCard({
  product,
  index,
  altitude,
}: {
  product: ProductWithExtras;
  index: number;
  altitude?: number;
}) {
  const minPack = product.packs[0];
  return (
    <article className="group relative border-b border-r border-line p-8 transition hover:bg-[rgba(200,132,58,0.04)] last:border-r-0">
      <div className="mb-7 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
        <span>N° {String(index + 1).padStart(2, '0')}</span>
        <span>{product.name}</span>
      </div>
      <div
        className="relative mb-7 grid aspect-[3/4] place-items-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(200, 132, 58, 0.4), transparent 65%), linear-gradient(180deg, #1a1410 0%, #0a0606 100%)',
        }}
      >
        <div
          aria-hidden
          className="h-[76%] w-[38%]"
          style={{
            background: 'linear-gradient(180deg, rgba(200,132,58,0.7), rgba(120,70,30,0.85))',
            clipPath:
              'polygon(35% 0%, 65% 0%, 65% 16%, 70% 26%, 70% 100%, 30% 100%, 30% 26%, 35% 16%)',
            boxShadow:
              'inset 4px 0 16px rgba(0,0,0,0.4), inset -4px 0 16px rgba(245,240,232,0.05)',
          }}
        />
        <span className="absolute left-1/2 top-[38%] z-[2] w-[26%] -translate-x-1/2 bg-paper px-1 py-2 text-center font-display text-[11px] uppercase tracking-[0.04em] text-[#1a1410]">
          Cumbre
        </span>
      </div>
      <h3 className="mb-2 font-display text-[56px] uppercase leading-[0.92] tracking-[-0.005em]">{product.name}</h3>
      <p className="mb-6 font-body text-[17px] italic text-accent">
        {product.style} · {fmtFormat(product.format)}
      </p>
      <dl className="grid grid-cols-3 gap-2 border-t border-line pt-[18px] font-mono text-[11px]">
        <Spec label="ABV" value={fmtAbv(product.abv)} />
        <Spec label="IBU" value={String(product.ibu)} />
        <Spec label="Altitud" value={altitude ? `${altitude} m` : '—'} />
      </dl>
      <div className="mt-6 flex items-baseline justify-between">
        <div>
          <span className="font-display text-[28px] tracking-[0.01em]">
            {minPack ? fmtPrice(minPack.priceCents) : '—'}
          </span>
          <span className="ml-1 font-mono text-[11px] text-muted">ARS / unidad</span>
        </div>
        <Link
          href={`/cervezas/${product.slug}` as Route}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
        >
          Comprar
          <span className="transition group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </article>
  );
}
