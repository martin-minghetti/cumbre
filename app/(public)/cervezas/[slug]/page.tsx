import { notFound } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fmtAbv, fmtFormat, getProductBySlug } from '@/lib/products';
import { getTastingForSlug } from '@/lib/tasting';
import { BuyBlock } from '@/components/public/BuyBlock';

const ALTITUDES: Record<string, number> = {
  'catedral-ipa-lata': 2405,
  'tronador-stout-porron': 3554,
  'lopez-helles-lata': 2076,
  'frey-pilsner-lata': 1837,
  'laguna-negra-schwarzbier-porron': 1670,
  'jakob-porter-lata': 2030,
};

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-5 pl-0 last:border-b-0 md:border-b-0 md:border-r md:pl-[18px] md:last:border-r-0">
      <dt className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{label}</dt>
      <dd className="font-display text-[36px] leading-[1] tracking-[0.005em]">{value}</dd>
    </div>
  );
}

function BatchCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">{label}</dt>
      <dd className="font-display text-[32px] leading-[1] tracking-[0.005em]">{value}</dd>
    </div>
  );
}


function TastingItem({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="border-b border-line pb-9 last:border-b-0">
      <h5 className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
        <strong className="mr-2 font-medium text-accent">{num}</strong>
        {title}
      </h5>
      <p className="font-body text-[24px] leading-[1.4]">{body}</p>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const altitude = ALTITUDES[product.slug];
  const tasting = getTastingForSlug(product.slug);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1500px] px-9 pt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        <Link href={'/cervezas' as Route} className="hover:text-accent">Cervezas</Link>
        <span className="mx-3 text-accent">/</span>
        <span>{product.style}</span>
        <span className="mx-3 text-accent">/</span>
        <span>{product.name}</span>
      </nav>

      {/* Product main */}
      <section className="mx-auto grid max-w-[1500px] grid-cols-1 items-stretch pb-20 md:grid-cols-[1.1fr_1fr]">
        {/* Left: image */}
        <div className="relative min-h-[70vh] overflow-hidden border-r border-line bg-[#050608] md:min-h-[90vh]">
          {product.heroImageUrl ? (
            <Image
              src={product.heroImageUrl}
              alt={`${product.name} ${product.style}`}
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          ) : null}
          {/* corner editorial */}
          <div className="absolute left-9 top-9 z-[2] font-mono text-[10.5px] uppercase tracking-[0.22em] text-[rgba(245,240,232,0.7)] mix-blend-screen">
            <strong className="font-medium text-accent">N° {String(product.id).padStart(2, '0')}</strong> · Línea Cumbres · 2026
          </div>
          {/* altitude bottom-left */}
          {altitude && (
            <div className="absolute bottom-9 left-9 z-[2] font-display text-[80px] leading-[0.85] tracking-[-0.01em] text-[rgba(200,132,58,0.55)] mix-blend-screen">
              {altitude.toLocaleString()}
              <small className="mt-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-[rgba(245,240,232,0.6)]">
                Metros · {product.name}, Bariloche
              </small>
            </div>
          )}
          {/* format pill bottom-right */}
          <div className="absolute bottom-9 right-9 z-[2] border border-line bg-[rgba(10,8,6,0.7)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent backdrop-blur-sm">
            {product.format === 'lata_473' ? '473 ml' : '1 L'} · Patagonia 41°S
          </div>
        </div>

        {/* Right: info */}
        <div className="flex flex-col gap-9 px-14 py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-6 border-b border-line pb-[18px] font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
            <div>
              <strong className="font-medium text-accent">EN STOCK</strong>
              {product.currentBatch && (
                <>
                  {' '}
                  · {product.currentBatch.unitsProduced.toLocaleString('es-AR')} unidades · lote {product.currentBatch.lotCode}
                </>
              )}
            </div>
            <div className="flex gap-3">
              <span className="border border-line-strong px-2.5 py-1 tracking-[0.18em] text-text-inverse">No pasteurizada</span>
              <span className="border border-line-strong px-2.5 py-1 tracking-[0.18em] text-text-inverse">Lúpulo entero</span>
            </div>
          </div>

          <h1 className="font-display text-[clamp(72px,11vw,160px)] uppercase leading-[0.85] tracking-[-0.01em]">
            {product.name}
          </h1>
          <p className="font-body text-[22px] italic text-accent">
            <span className="mr-3 text-muted">—</span>
            {product.style} · {fmtFormat(product.format)}
          </p>
          {product.description && (
            <p className="max-w-[540px] text-[17px] leading-[1.65]">{product.description}</p>
          )}

          <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
            <Spec label="ABV" value={fmtAbv(product.abv)} />
            <Spec label="IBU" value={String(product.ibu)} />
            <Spec label="Formato" value={product.format === 'lata_473' ? '473 ml' : '1 L'} />
            <Spec label="Altitud" value={altitude ? `${altitude} m` : '—'} />
          </dl>

          <BuyBlock packs={product.packs} />
        </div>
      </section>

      {/* Current batch */}
      {product.currentBatch && (
        <section
          className="my-20 border-y border-line px-9 py-16"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(200,132,58,0.07), transparent 60%)' }}
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-20 md:grid-cols-[auto_1fr]">
            <div className="max-w-[280px] font-display text-[88px] uppercase leading-[0.85] tracking-[-0.01em]">
              Este <em className="font-body font-light italic text-accent">lote</em>.
            </div>
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <BatchCell label="Código" value={product.currentBatch.lotCode} />
              <BatchCell
                label="Envasado"
                value={product.currentBatch.bottledAt
                  .toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                  .replace(/\//g, ' · ')}
              />
              <BatchCell label="Volumen" value={`${product.currentBatch.volumeProducedL} L`} />
              <BatchCell label="Unidades" value={product.currentBatch.unitsProduced.toLocaleString('es-AR')} />
              {product.currentBatch.notes && (
                <div className="col-span-2 mt-4 max-w-[720px] border-t border-line pt-7 font-body text-[17px] italic text-muted md:col-span-4">
                  <span className="mr-2 font-mono text-[10.5px] not-italic uppercase tracking-[0.22em] text-accent">
                    ↳ Nota del brewmaster ·
                  </span>
                  {product.currentBatch.notes}
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      {/* Tasting */}
      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-20 px-9 py-32 md:grid-cols-2">
        <aside className="md:sticky md:top-24 md:self-start">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Cata</p>
          <h3 className="font-display text-[clamp(48px,6vw,96px)] uppercase leading-[0.92] tracking-[-0.005em]">
            Lo que vas a <em className="font-body font-light italic text-accent">sentir</em>.
          </h3>
        </aside>
        <div className="flex flex-col gap-10">
          <TastingItem num="01" title="Vista" body={tasting.vista} />
          <TastingItem num="02" title="Nariz" body={tasting.nariz} />
          <TastingItem num="03" title="Boca" body={tasting.boca} />
          <TastingItem num="04" title="Temperatura" body={tasting.temp} />
        </div>
      </section>
    </>
  );
}
