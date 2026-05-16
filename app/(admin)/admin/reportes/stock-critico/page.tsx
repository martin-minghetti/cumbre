import { getCriticalStockProducts } from '@/lib/admin/reports';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/admin/Badge';
import { EmptyState } from '@/components/admin/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function StockCriticoPage() {
  const rows = await getCriticalStockProducts();
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Analisis / Stock critico"
        title="Stock critico"
        subtitle="Productos e insumos bajo el reorder point."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Todo en orden"
          helper="Ningun item esta bajo el reorder point."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="text-right">Faltante</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.kind}-${r.id}`}>
                  <TableCell><StatusBadge tone={r.kind === 'product' ? 'glacier' : 'copper'}>{r.kind === 'product' ? 'Producto' : 'Insumo'}</StatusBadge></TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-red-600">{r.stock} {r.unit ?? ''}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{r.reorderPoint}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{r.reorderPoint - r.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
