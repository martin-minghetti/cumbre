import type { Route } from 'next';
import Link from 'next/link';
import { brand } from '@/config/brand';
import { CumbreCard } from '@/components/public/CumbreCard';
import { HeroBg } from '@/components/public/HeroBg';
import { Marquee } from '@/components/public/Marquee';
import { getAllActiveProducts } from '@/lib/products';

// Altitudes are domain metadata not yet in DB. Map by slug for Phase 2 display.
const ALTITUDES: Record<string, number> = {
  'catedral-ipa-lata': 2405,
  'tronador-stout-porron': 3554,
  'lopez-helles-lata': 2076,
  'frey-pilsner-lata': 1837,
  'laguna-negra-schwarzbier-porron': 1670,
  'jakob-porter-lata': 2030,
};

function HeroMeta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="text-[16px] leading-[1.4]">{children}</dd>
    </div>
  );
}

export default async function HomePage() {
  const all = await getAllActiveProducts();
  const featured = all.slice(0, 3);

  return (
    <>
      <section className="relative grid min-h-screen grid-rows-[1fr_auto] overflow-hidden px-9 pb-9 pt-[120px]">
        <HeroBg />
        <div className="relative z-[2] self-end reveal">
          <p className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.34em] text-accent">
            <span className="h-px w-7 bg-accent" />
            San Carlos de Bariloche · 41°08′S · 1907 m
          </p>
          <h1 className="mb-8 font-display text-[clamp(80px,17vw,280px)] uppercase leading-[0.86] tracking-[-0.01em]">
            CUMBR<span className="font-body font-light italic tracking-[-0.03em] text-accent">e</span>
          </h1>
          <dl className="grid max-w-[920px] gap-12 border-t border-line pt-9 md:grid-cols-3">
            <HeroMeta label="Lo que hacemos">
              Cerveza artesanal envasada en lata 473 ml y porrón 1 L. Producción <em className="text-snow">en altura</em>, sin pasteurizar, lote a lote.
            </HeroMeta>
            <HeroMeta label="Dónde estamos">
              {brand.address.street} — {brand.address.city}, Río Negro. <br />
              <em className="text-snow">Taproom abierto Mar-Sáb 17 a 24h.</em>
            </HeroMeta>
            <HeroMeta label="Cómo enviamos">
              Delivery local en 24h · Retiro en taproom · Mayorista para bares y vinotecas.
            </HeroMeta>
          </dl>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-[120px] px-9 py-40 md:grid-cols-[1fr_1.4fr]">
        <aside className="md:sticky md:top-[120px]">
          <p className="text-[14px] text-accent">— 01</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">De qué se trata</p>
        </aside>
        <div className="max-w-[740px] font-body text-[38px] font-light leading-[1.18] tracking-[-0.005em]">
          Cada lote que envasamos sale firmado con su altitud. La levadura no se comporta igual a 1.000 metros que a 1.900 — la presión cambia, la fermentación se estira, y la cerveza termina con un perfil que <em className="italic text-accent">no se puede copiar abajo</em>. Por eso cada Cumbre lleva el dato del lugar donde se hizo, como las botellas de vino llevan terroir.
          <span className="mt-12 block text-[16px] not-italic leading-[1.7] text-muted">
            Producimos en serie corta, sin pasteurizar, con maltas argentinas y lúpulos de la Comarca Andina. El stock se va; reponemos en el siguiente batch. Si tu cerveza favorita no está, es que está fermentando.
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-9 pb-40 pt-20">
        <header className="mb-20 flex items-end justify-between border-b border-line pb-7">
          <h2 className="font-display text-[clamp(48px,7vw,120px)] uppercase leading-[0.9] tracking-[-0.01em]">
            Las <em className="font-body font-light italic tracking-[-0.03em] text-accent">Cumbres</em>
          </h2>
          <Link
            href={'/cervezas' as Route}
            className="border-b border-accent pb-1 font-mono text-[11.5px] uppercase tracking-[0.2em]"
          >
            Ver las {all.length} cervezas →
          </Link>
        </header>
        <div className="grid grid-cols-1 border-t border-line md:grid-cols-3">
          {featured.map((p, i) => (
            <CumbreCard key={p.id} product={p} index={i} altitude={ALTITUDES[p.slug]} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper px-9 py-40 text-[#1a1410]">
        <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 items-start gap-20 md:grid-cols-[auto_1fr]">
          <div className="font-display text-[200px] leading-[0.85] text-accent">02</div>
          <div>
            <h3 className="mb-9 font-display text-[clamp(40px,5.5vw,88px)] uppercase leading-[0.94] tracking-[-0.005em]">
              No competimos con la <em className="font-body font-light italic tracking-[-0.03em] text-accent-deep">cerveza industrial</em>.<br />
              Hacemos <em className="font-body font-light italic tracking-[-0.03em] text-accent-deep">otra cosa</em>.
            </h3>
            <p className="mb-6 max-w-[620px] text-[19px] leading-[1.6] text-[#3a2a1a]">
              Lo industrial llena heladeras a 200 pesos el litro y está bien. Nosotros usamos un fermentador de acero inoxidable de 800 L, lúpulo entero (no extracto), agua de deshielo filtrada, y un proceso que tarda entre 4 y 7 semanas según el estilo.
            </p>
            <p className="mb-6 max-w-[620px] text-[19px] leading-[1.6] text-[#3a2a1a]">
              Si lo que querés es una rubia liviana para tomar en cantidad, comprala en el supermercado. Si lo que buscás es probar la misma receta hecha en tres altitudes distintas, vení.
            </p>
            <div className="mt-14 flex gap-14 border-t border-[rgba(26,20,16,0.2)] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(26,20,16,0.6)]">
              <span>↳ Maestro cervecero</span>
              <span>Lote · IPA-260512-01</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line px-9 py-40">
        <div
          aria-hidden
          className="absolute inset-0 -z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 80% 30%, rgba(91,122,140,0.18), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(200,132,58,0.1), transparent 65%)',
          }}
        />
        <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-end gap-24 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-[clamp(60px,9vw,160px)] uppercase leading-[0.86] tracking-[-0.01em]">
              Vení al <em className="font-body font-light italic text-accent">taproom</em>.<br />
              Probás <em className="font-body font-light italic text-accent">todo</em>.
            </h2>
          </div>
          <div>
            <p className="max-w-[380px] text-muted">
              Tenemos 12 canillas rotativas, growlers para llevar, tabla de embutidos y quesos locales, y la mesa larga al lado del fermentador. Si querés ver cómo se hace, te lo mostramos.
            </p>
            <dl className="mt-6 grid grid-cols-[90px_1fr] gap-x-5 gap-y-3.5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Dónde</dt>
              <dd className="text-[16px]">{brand.shipping.pickup.address ?? brand.address.street}</dd>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Horario</dt>
              <dd className="text-[16px]">{brand.shipping.pickup.hours ?? 'Mar a Sáb · 17:00 a 24:00 h'}</dd>
            </dl>
            <Link
              href={'/visitas' as Route}
              className="mt-12 inline-flex items-center gap-3.5 bg-accent px-7 py-4 font-display text-[16px] uppercase tracking-[0.04em] text-bg transition hover:bg-snow"
            >
              Cómo llegar →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
