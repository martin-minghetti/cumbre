import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { currentUser } from '@/lib/auth/current-user';
import { getOpenSessionForUser } from '@/lib/admin/cash-sessions';
import { getPosCatalog } from '@/lib/admin/pos-catalog';
import { PosGrid } from '@/components/admin/PosGrid';

export const dynamic = 'force-dynamic';

const fmtCents = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export default async function PosPage() {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);
  const open = await getOpenSessionForUser(user.id);
  if (!open) redirect('/admin/pos/no-session' as Route);

  const catalog = await getPosCatalog();
  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="border-b border-border/60 px-6 py-3 flex items-baseline justify-between gap-4 shrink-0">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-2xl uppercase leading-none text-foreground">POS</h1>
          <span className="admin-eyebrow">Caja / Punto de venta</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <span>Sesion <span className="text-primary">#{open.id}</span></span>
          <span aria-hidden>/</span>
          <span>Cajero <span className="text-foreground">{user.name}</span></span>
          <span aria-hidden>/</span>
          <span>Inicio <span className="text-foreground tabular-nums">{fmtCents(Number(open.openingAmountCents))}</span></span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <PosGrid catalog={catalog} cashSessionId={open.id} />
      </div>
    </div>
  );
}
