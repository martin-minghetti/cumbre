export default function TerminosPage() {
  return (
    <article className="mx-auto max-w-[800px] px-9 pt-[140px] pb-32">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Legales / Términos</p>
      <h1 className="mb-12 font-display text-[clamp(48px,7vw,96px)] uppercase leading-[0.92]">
        Términos y <em className="font-body font-light italic text-accent">condiciones</em>.
      </h1>
      <div className="space-y-6 font-body text-[17px] leading-[1.65] text-muted">
        <p>Al comprar en cumbre.beer aceptás estos términos. Los precios incluyen IVA. Los productos se venden hasta agotar stock — si una cerveza queda sin stock entre que la viste y pagaste, te avisamos y te reembolsamos.</p>
        <p>Las imágenes son ilustrativas. El sabor del lote actual puede variar ligeramente del descripto — no compensamos por matices de cata, sí por defectos reales (botella rota, lote en mal estado). Para reclamos: hola@cumbre.beer dentro de 48 h de recibido.</p>
        <p>Defensa del Consumidor: Ley 24.240. Jurisdicción Tribunales Ordinarios de Bariloche, Río Negro.</p>
      </div>
    </article>
  );
}
