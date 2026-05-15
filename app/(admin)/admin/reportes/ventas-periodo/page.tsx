import { getSalesByPeriod } from '@/lib/admin/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function VentasPeriodoPage() {
  const rows = await getSalesByPeriod(30);
  const total = rows.reduce((s, r) => s + r.totalCents, 0);
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Ventas por dia</h1>
        <p className="text-sm text-muted-foreground">Ultimos 30 dias. Total: {fmt(total)}</p>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Dia</TableHead>
            <TableHead className="text-right">Ordenes</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8">Sin ventas en el periodo.</TableCell></TableRow>
            : rows.map((r) => (
              <TableRow key={r.day}>
                <TableCell>{r.day}</TableCell>
                <TableCell className="text-right tabular-nums">{r.orders}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.totalCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
