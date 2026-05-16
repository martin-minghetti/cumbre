import Link from 'next/link';
import Image from 'next/image';
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
      <div className="relative mb-7 aspect-[3/4] overflow-hidden bg-[#050608]">
        {product.heroImageUrl ? (
          <Image
            src={product.heroImageUrl}
            alt={`${product.name} ${product.style}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(200,132,58,0.4),transparent_65%),linear-gradient(180deg,#1a1410_0%,#0a0606_100%)]" />
        )}
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
