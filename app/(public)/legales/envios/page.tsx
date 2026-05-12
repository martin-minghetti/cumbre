export default function EnviosPage() {
  return (
    <article className="mx-auto max-w-[800px] px-9 pt-[140px] pb-32">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Legales / Envíos</p>
      <h1 className="mb-12 font-display text-[clamp(48px,7vw,96px)] uppercase leading-[0.92]">
        Cómo <em className="font-body font-light italic text-accent">llega</em>.
      </h1>
      <div className="space-y-6 font-body text-[17px] leading-[1.65] text-muted">
        <p>Hacemos delivery propio en Bariloche en menos de 24 horas hábiles. Dos zonas: centro (hasta 5 km del taproom, $2.500) y periferia (hasta 15 km, $4.500). Fuera de esa zona no llegamos por ahora — escribinos si estás cerca.</p>
        <p>También podés retirar gratis por el taproom (Av. Bustillo Km 0,5). En el horario de atención, sin reserva. Te avisamos cuando tu pedido está listo.</p>
        <p>El delivery verifica DNI antes de entregar. Si nadie está disponible o el receptor es menor de 18, no entregamos y reintentamos al día siguiente.</p>
      </div>
    </article>
  );
}
