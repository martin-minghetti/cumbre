import Link from 'next/link';
import type { Route } from 'next';
import { brand } from '@/config/brand';

export function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-bg/55 px-9 py-5 backdrop-blur-md">
      <Link href={'/' as Route} className="font-display text-[22px] uppercase tracking-[0.04em] text-text-inverse">
        <span className="mr-2.5 align-[2px] text-[14px] text-accent">▲</span>
        {brand.name}
      </Link>
      <ul className="hidden gap-9 font-mono text-[11.5px] uppercase tracking-[0.18em] md:flex">
        <li><Link href={'/cervezas' as Route} className="opacity-80 transition hover:text-accent hover:opacity-100">Cervezas</Link></li>
        <li><Link href={'/nosotros' as Route} className="opacity-80 transition hover:text-accent hover:opacity-100">Producción</Link></li>
        <li><Link href={'/visitas' as Route} className="opacity-80 transition hover:text-accent hover:opacity-100">Taproom</Link></li>
        <li><Link href={'/mayorista' as Route} className="opacity-80 transition hover:text-accent hover:opacity-100">Mayorista</Link></li>
      </ul>
      <span className="border border-line-strong px-4 py-2 font-mono text-[11.5px] uppercase tracking-[0.18em]">
        Carrito · 0
      </span>
    </nav>
  );
}
