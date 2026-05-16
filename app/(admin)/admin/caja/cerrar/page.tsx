import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { currentUser } from '@/lib/auth/current-user';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getOpenSessionForUser, calcExpectedAmountCents } from '@/lib/admin/cash-sessions';
import { closeSessionAction } from '../actions';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const fmtCents = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export default async function CerrarCajaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);
  const open = await getOpenSessionForUser(user.id);
  if (!open) redirect('/admin/caja' as Route);
  const sp = await searchParams;

  const sales = await db.execute(sql`
    SELECT total_cents AS "totalCents", payment_method AS "paymentMethod"
    FROM pos_sales WHERE cash_session_id = ${open.id}
  `);
  const expected = calcExpectedAmountCents(
    Number(open.openingAmountCents),
    sales.rows.map((r) => {
      const o = r as Record<string, unknown>;
      return { totalCents: Number(o.totalCents), paymentMethod: String(o.paymentMethod) };
    }),
  );

  return (
    <div className="p-8 space-y-8 max-w-md">
      <AdminPageHeader
        eyebrow="Caja / Cierre"
        title="Cerrar caja"
        subtitle={`Sesion #${open.id}, contar fisico y registrar diferencia.`}
      />
      <Card>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>Sesion #{open.id} abierta {new Date(open.openedAt).toLocaleString('es-AR')}</p>
            <p>Inicio: {fmtCents(Number(open.openingAmountCents))}</p>
            <p>Ventas registradas: {sales.rows.length}</p>
            <p className="font-mono">Esperado en caja (cash): {fmtCents(expected)}</p>
          </div>
          <form action={closeSessionAction} className="space-y-3">
            <input type="hidden" name="sessionId" value={open.id} />
            <div className="space-y-1">
              <Label htmlFor="closingAmountCountedCents">Conteo fisico (centavos)</Label>
              <Input id="closingAmountCountedCents" name="closingAmountCountedCents" type="number" min={0} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" name="notes" placeholder="(opcional)" />
            </div>
            {sp.error === 'invalid' && <p className="text-sm text-destructive">Datos invalidos.</p>}
            <Button type="submit" variant="destructive">Cerrar caja</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
