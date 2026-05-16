import { getSalesByPeriod } from '@/lib/admin/reports';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function VentasPeriodoPage() {
  const rows = await getSalesByPeriod(30);
  const total = rows.reduce((s, r) => s + r.totalCents, 0);
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Analisis / Periodo"
        title="Ventas por dia"
        subtitle={`Ultimos 30 dias, TZ Argentina. Total: ${fmt(total)}.`}
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Sin ventas en el periodo"
          helper="Aun no hay ventas en los ultimos 30 dias."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Dia</TableHead>
              <TableHead className="text-right">Ordenes</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.day}>
                  <TableCell className="font-mono tabular-nums">{r.day}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.orders}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(r.totalCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
