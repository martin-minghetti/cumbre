import { getMarginByProduct } from '@/lib/admin/reports';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function MargenPage() {
  const rows = await getMarginByProduct(30);
  return (
    <div className="p-8 space-y-8">
      <div className="rounded-md border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs">
        Nota: margen calculado solo sobre ventas online. POS no incluido en este reporte (proxima iteracion).
      </div>
      <AdminPageHeader
        eyebrow="Analisis / Margen"
        title="Margen por producto"
        subtitle="Ultimos 30 dias, costo promedio por unidad producida."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Sin datos de margen"
          helper="Necesitas ventas online en los ultimos 30 dias."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-right">Margen</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.productId}>
                  <TableCell>{r.productName}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(r.revenueCents)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(r.costCents)}</TableCell>
                  <TableCell className={'text-right font-mono tabular-nums ' + (r.marginCents < 0 ? 'text-red-600' : 'text-green-700')}>{fmt(r.marginCents)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{(r.marginPct * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
