import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth/current-user';
import { getOpenSessionForUser, listSessions } from '@/lib/admin/cash-sessions';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmtCents = (n: number | null) =>
  n == null ? 's/d' :
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export default async function CajaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);
  const sp = await searchParams;
  const open = await getOpenSessionForUser(user.id);
  // owner ve todo el historico, cashier solo el propio
  const history = await listSessions(user.role === 'owner' ? {} : { userIdScope: user.id });

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Caja / Sesiones"
        title="Caja"
        subtitle="Apertura, cierre y arqueo del turno."
      />

      {sp.error && (
        <p className="text-sm text-destructive">Error: {sp.error}</p>
      )}

      {open ? (
        <Card>
          <CardHeader><CardTitle>Sesion abierta #{open.id}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">Abierta: {new Date(open.openedAt).toLocaleString('es-AR')}</p>
            <p className="text-sm">Inicio: {fmtCents(Number(open.openingAmountCents))}</p>
            <div className="flex gap-2 pt-2">
              <Button asChild><Link href={'/admin/pos' as Route}>Ir al POS</Link></Button>
              <Button asChild variant="destructive"><Link href={'/admin/caja/cerrar' as Route}>Cerrar caja</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>No hay caja abierta</CardTitle></CardHeader>
          <CardContent>
            <Button asChild><Link href={'/admin/caja/abrir' as Route}>Abrir caja</Link></Button>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Cajero</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead className="text-right">Inicio</TableHead>
              <TableHead className="text-right">Esperado</TableHead>
              <TableHead className="text-right">Contado</TableHead>
              <TableHead className="text-right">Diff</TableHead>
              <TableHead className="text-right">Ventas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-6">Sin sesiones.</TableCell></TableRow>
            ) : history.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">#{s.id}</TableCell>
                <TableCell>{s.openedByName}</TableCell>
                <TableCell className="text-xs">{new Date(s.openedAt).toLocaleString('es-AR')}</TableCell>
                <TableCell className="text-xs">{s.closedAt ? new Date(s.closedAt).toLocaleString('es-AR') : <span className="text-emerald-600">abierta</span>}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtCents(s.openingAmountCents)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtCents(s.closingAmountExpectedCents)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtCents(s.closingAmountCountedCents)}</TableCell>
                <TableCell className={`text-right tabular-nums ${s.diffCents != null && s.diffCents !== 0 ? 'text-destructive font-semibold' : ''}`}>{fmtCents(s.diffCents)}</TableCell>
                <TableCell className="text-right tabular-nums">{s.salesCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
