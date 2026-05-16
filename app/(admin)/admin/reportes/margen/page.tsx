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
      <AdminPageHeader
        eyebrow="Analisis / Margen"
        title="Margen por producto"
        subtitle="Ultimos 30 dias, costo promedio por unidad producida."
      />
      <div className="rounded-md border-l-4 border-amber-500 bg-amber-500/10 p-3 text-xs flex items-start gap-2">
        <span className="font-mono uppercase tracking-wider text-amber-700 text-[10px] mt-0.5">Aviso</span>
        <p className="text-amber-900 dark:text-amber-100">Margen calculado solo sobre ventas online. POS no incluido en este reporte (proxima iteracion).</p>
      </div>
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
