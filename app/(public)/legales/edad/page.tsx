export default function EdadPage() {
  return (
    <article className="mx-auto max-w-[800px] px-9 pt-[140px] pb-32">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Legales / Edad</p>
      <h1 className="mb-12 font-display text-[clamp(48px,7vw,96px)] uppercase leading-[0.92]">
        Venta a <em className="font-body font-light italic text-accent">mayores</em> de 18.
      </h1>
      <div className="space-y-6 font-body text-[17px] leading-[1.65] text-muted">
        <p>Está prohibida en Argentina la venta de bebidas alcohólicas a menores de 18 años (Ley 24.788). Para entrar a este sitio tenés que confirmar tu edad. La declaración es responsable; no verificamos documento al hacer la compra online, pero el delivery sí verifica DNI antes de entregar.</p>
        <p>Si sos menor, no vas a poder recibir tu pedido. Si comprás para terceros, te pedimos que verifiques edad antes de entregar.</p>
        <p>Tomar con moderación. Si manejás, no tomes.</p>
      </div>
    </article>
  );
}
