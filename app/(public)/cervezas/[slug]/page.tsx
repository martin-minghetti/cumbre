import { notFound } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import { fmtAbv, fmtFormat, fmtPrice, getProductBySlug } from '@/lib/products';

const ALTITUDES: Record<string, number> = {
  'catedral-ipa-lata': 2405,
  'tronador-stout-porron': 3554,
  'lopez-helles-lata': 2076,
  'frey-pilsner-lata': 1837,
  'piltri-golden-porron': 2284,
  'campanario-porter-lata': 1980,
};

const DEFAULT_TASTING = {
  vista: 'Color ámbar dorado con reflejos cobrizos. Espuma blanca compacta, persistencia media-alta. Carbonatación visible en columnas finas.',
  nariz: 'Pomelo, naranja, mango. Detrás un pan dulce sutil, sin caramelo dominante. Lúpulo presente pero no agresivo.',
  boca: 'Entrada cítrica y resinosa, cuerpo medio, amargor seco que se queda. Final largo con notas de pino y cáscara de naranja. Pide otra.',
  temp: 'Servir a 6–8°C. Si está más fría se pierden los aromas del dry-hop. Si está más caliente, el alcohol se nota de más.',
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

function SelectGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function SelectOption({ label, sub, active }: { label: string; sub: string; active?: boolean }) {
  return (
    <button
      type="button"
      disabled
      className={`flex-1 border px-3 py-3.5 text-center font-display text-[18px] uppercase tracking-[0.01em] transition ${
        active ? 'border-accent bg-accent text-bg' : 'border-line text-text-inverse'
      } opacity-60`}
      title="Selector activo en Phase 3"
    >
      {label}
      <small className="mt-0.5 block font-mono text-[10px] tracking-[0.18em] opacity-70">{sub}</small>
    </button>
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
  const tasting = DEFAULT_TASTING;
  const minPack = product.packs[0];

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
        <div
          className="relative min-h-[70vh] overflow-hidden border-r border-line md:min-h-[90vh]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 65%, rgba(200,132,58,0.45), transparent 60%), linear-gradient(180deg, #0d0a08 0%, #1a1208 45%, #0a0606 100%)',
          }}
        >
          {/* topo contour lines */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 50% 30% at 50% 60%, transparent 78%, rgba(200,132,58,0.13) 80%, transparent 82%),
                radial-gradient(ellipse 40% 22% at 50% 60%, transparent 75%, rgba(200,132,58,0.13) 77%, transparent 79%),
                radial-gradient(ellipse 30% 16% at 50% 60%, transparent 70%, rgba(200,132,58,0.13) 72%, transparent 74%),
                radial-gradient(ellipse 22% 12% at 50% 60%, transparent 65%, rgba(200,132,58,0.13) 67%, transparent 69%)
              `,
            }}
          />
          {/* can silhouette */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[70%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-md"
            style={{
              background:
                'linear-gradient(90deg, rgba(200,132,58,0.85) 0%, rgba(225,160,90,0.95) 25%, rgba(180,100,40,1) 50%, rgba(225,160,90,0.95) 75%, rgba(200,132,58,0.85) 100%)',
              boxShadow: 'inset 0 0 28px rgba(0,0,0,0.35), 0 30px 60px rgba(0,0,0,0.5)',
            }}
          />
          {/* label */}
          <div className="absolute left-1/2 top-1/2 z-[3] w-[24%] -translate-x-1/2 -translate-y-1/2 border-y-[3px] border-accent-deep bg-paper px-3 py-4 text-center text-[#1a1410]">
            <div className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-accent-deep">▲ {product.style}</div>
            <div className="mb-1.5 font-display text-[30px] uppercase leading-[0.9] tracking-[0.01em]">{product.name}</div>
            <div className="font-body text-[11px] italic leading-[1.4] text-[#5a3520]">
              Patagonia · 41°S · sin pasteurizar · {product.format === 'lata_473' ? '473 ml' : '1 L'}
            </div>
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-deep">
              ▲ {altitude ?? '—'} m
            </div>
          </div>
          {/* corner */}
          <div className="absolute left-9 top-9 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[rgba(245,240,232,0.55)]">
            <strong className="font-medium text-accent">N° {String(product.id).padStart(2, '0')}</strong> · Línea Cumbres · 2026
          </div>
          {/* altitude bottom-left */}
          {altitude && (
            <div className="absolute bottom-9 left-9 font-display text-[80px] leading-[0.85] tracking-[-0.01em] text-[rgba(200,132,58,0.45)]">
              {altitude.toLocaleString()}
              <small className="mt-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-[rgba(245,240,232,0.4)]">
                Metros · {product.name}, Bariloche
              </small>
            </div>
          )}
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

          <div className="grid gap-6 md:grid-cols-2">
            <SelectGroup label="Formato">
              <SelectOption active label="Lata" sub="473 ml" />
              <SelectOption label="Porrón" sub="1 L" />
            </SelectGroup>
            <SelectGroup label="Pack">
              <SelectOption active label="Unidad" sub="×1" />
              <SelectOption label="Pack 6" sub="−12%" />
            </SelectGroup>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-end gap-8 border-t border-line pt-[18px]">
            <div>
              <div className="font-display text-[64px] leading-[1] tracking-[0.005em]">
                {minPack ? fmtPrice(minPack.priceCents) : '—'}
                <small className="ml-1.5 font-mono text-[12px] uppercase tracking-[0.2em] text-muted">ARS</small>
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="text-accent">▲ </span>Envío Bariloche 24 h · Retiro en taproom gratis
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Carrito disponible en Phase 3"
              className="bg-accent px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-bg opacity-60"
            >
              Próximamente →
            </button>
          </div>
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
