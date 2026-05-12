import { brand } from '@/config/brand';

export default function VisitasPage() {
  return (
    <article className="mx-auto max-w-[920px] px-9 pt-[140px] pb-32">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">— Taproom</p>
      <h1 className="mb-14 font-display text-[clamp(60px,9vw,140px)] uppercase leading-[0.88] tracking-[-0.01em]">
        Vení a <em className="font-body font-light italic text-accent">probar</em>.
      </h1>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-5 font-body text-[18px] leading-[1.6] text-muted">
          <p>Tenemos 12 canillas rotativas con todo lo que hacemos. Pedís el flight de 4 medidas chicas y armás tu propio recorrido. Si te enganchás con alguna, llevás un growler de 1 L para casa.</p>
          <p>Mesa larga al lado del fermentador, sin manteles. Picadas locales de quesos de Colonia Suiza y embutidos de El Bolsón. Los viernes a la noche llenamos — venir antes de las 21 si querés mesa.</p>
        </div>
        <dl className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-5 font-mono text-[13px]">
          <dt className="text-[10.5px] uppercase tracking-[0.22em] text-muted">Dirección</dt>
          <dd>{brand.address.street} <br /> {brand.address.city}, {brand.address.province}</dd>
          <dt className="text-[10.5px] uppercase tracking-[0.22em] text-muted">Horario</dt>
          <dd>{brand.shipping.pickup.hours} <br /> Cerrado domingo y lunes</dd>
          <dt className="text-[10.5px] uppercase tracking-[0.22em] text-muted">Reservas</dt>
          <dd>No hace falta · Viernes y sábados llega temprano</dd>
          <dt className="text-[10.5px] uppercase tracking-[0.22em] text-muted">Estacionamiento</dt>
          <dd>Sí, gratis al frente</dd>
        </dl>
      </div>
    </article>
  );
}
