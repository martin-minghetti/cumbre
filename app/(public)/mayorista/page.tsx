export default function MayoristaPage() {
  return (
    <article className="mx-auto max-w-[920px] px-9 pt-[140px] pb-32">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Mayorista</p>
      <h1 className="mb-10 font-display text-[clamp(60px,9vw,140px)] uppercase leading-[0.88] tracking-[-0.01em]">
        Para <em className="font-body font-light italic text-accent">bares</em> y <em className="font-body font-light italic text-accent">vinotecas</em>.
      </h1>
      <p className="mb-14 max-w-[700px] font-body text-[18px] leading-[1.6] text-muted">
        Si tenés un bar, restaurante, parrilla, vinoteca, almacén de cervezas o cualquier punto de venta y querés tener Cumbre en heladera, escribinos. Listas de precios distintas, cuenta corriente a 30 días, despacho semanal desde Bariloche. Pedido mínimo 60 unidades mezcladas.
      </p>
      <a
        href="mailto:mayorista@cumbre.beer"
        className="inline-flex items-center gap-3 bg-accent px-7 py-4 font-display text-[16px] uppercase tracking-[0.04em] text-bg transition hover:bg-snow"
      >
        Pedir lista de precios →
      </a>
    </article>
  );
}
