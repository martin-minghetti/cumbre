import Link from 'next/link';
import type { Route } from 'next';
import { brand } from '@/config/brand';

type FooterLink = { href: string; label: string };

function FooterCol({ title, items }: { title: string; items: FooterLink[] }) {
  return (
    <div>
      <h4 className="mb-[18px] font-mono text-[10.5px] uppercase tracking-[0.24em] text-accent">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {items.map(({ href, label }) => (
          <li key={href}>
            <Link href={href as Route} className="text-[15px] opacity-70 hover:opacity-100">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#050608] px-9 py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 border-b border-line pb-[72px] md:grid-cols-[2fr_1fr_1fr_1fr]">
          <h2 className="font-display text-[88px] uppercase leading-[0.86]">
            CUMBR<em className="font-body font-light italic text-accent">e</em>
          </h2>
          <FooterCol
            title="Tienda"
            items={[
              { href: '/cervezas', label: 'Cervezas' },
              { href: '/cervezas?pack=6', label: 'Pack 6' },
              { href: '/visitas', label: 'Visitar taproom' },
            ]}
          />
          <FooterCol
            title="Visita"
            items={[
              { href: '/visitas', label: 'Taproom' },
              { href: '/nosotros', label: 'Producción' },
              { href: '/mayorista', label: 'Mayorista' },
            ]}
          />
          <FooterCol
            title="Contacto"
            items={[
              { href: `mailto:${brand.email}`, label: brand.email },
              { href: `tel:${brand.phone}`, label: brand.phone },
              { href: `https://instagram.com/${brand.social.instagram.replace('@', '')}`, label: brand.social.instagram },
            ]}
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-3 pt-8 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:gap-0">
          <span>© 2026 {brand.legalName} · {brand.address.city}, AR</span>
          <span>Beber con moderación · Prohibida la venta a menores de {brand.ageGate.minAge}</span>
        </div>
      </div>
    </footer>
  );
}
