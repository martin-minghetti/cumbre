export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-[800px] px-9 pt-[140px] pb-32">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Legales / Privacidad</p>
      <h1 className="mb-12 font-display text-[clamp(48px,7vw,96px)] uppercase leading-[0.92]">
        Tus <em className="font-body font-light italic text-accent">datos</em>.
      </h1>
      <div className="space-y-6 font-body text-[17px] leading-[1.65] text-muted">
        <p>Guardamos lo justo: nombre, email, teléfono y dirección de entrega para procesar tu pedido. Los datos viven en una base Postgres con acceso restringido y se usan solo para enviarte la cerveza y comunicarnos si algo sale mal.</p>
        <p>No vendemos ni cedemos tu información a terceros. Mercado Pago procesa los pagos por separado y nunca vemos tu tarjeta. La política de MP rige sobre los datos financieros.</p>
        <p>Si querés borrar tu cuenta y todo lo asociado, escribinos a hola@cumbre.beer y lo hacemos en 48 h. Ley 25.326 vigente.</p>
      </div>
    </article>
  );
}
