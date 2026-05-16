import { CumbreCard } from '@/components/public/CumbreCard';
import { getAllActiveProducts } from '@/lib/products';

const ALTITUDES: Record<string, number> = {
  'catedral-ipa-lata': 2405,
  'tronador-stout-porron': 3554,
  'lopez-helles-lata': 2076,
  'frey-pilsner-lata': 1837,
  'laguna-negra-schwarzbier-porron': 1670,
  'jakob-porter-lata': 2030,
};

export default async function CervezasPage() {
  const all = await getAllActiveProducts();
  return (
    <section className="mx-auto max-w-[1400px] px-9 pt-[120px] pb-40">
      <header className="mb-16 flex items-end justify-between border-b border-line pb-8">
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
            — Las {all.length} cumbres
          </p>
          <h1 className="font-display text-[clamp(60px,10vw,160px)] uppercase leading-[0.88] tracking-[-0.01em]">
            Las <em className="font-body font-light italic text-accent">cervezas</em>
          </h1>
        </div>
        <p className="hidden max-w-[280px] font-body text-[14px] italic text-muted md:block">
          Cada nombre es una cumbre patagónica. Cada lote, una altitud distinta.
        </p>
      </header>
      <div className="grid grid-cols-1 border-t border-line md:grid-cols-2 lg:grid-cols-3">
        {all.map((p, i) => (
          <CumbreCard key={p.id} product={p} index={i} altitude={ALTITUDES[p.slug]} />
        ))}
      </div>
    </section>
  );
}
