import { getTopProducts } from '@/lib/admin/reports';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function TopProductosPage() {
  const rows = await getTopProducts(30, 10);
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Analisis / Ranking"
        title="Top productos"
        subtitle="Ultimos 30 dias, ranking por revenue (online + POS)."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Sin ventas en el periodo"
          helper="Necesitas ventas en los ultimos 30 dias."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>#</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.productId}>
                  <TableCell className="font-mono tabular-nums text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.units}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(r.revenueCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
