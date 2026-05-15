import { getCriticalStockProducts } from '@/lib/admin/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function StockCriticoPage() {
  const rows = await getCriticalStockProducts();
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Stock critico</h1>
        <p className="text-sm text-muted-foreground">Productos e insumos bajo su reorder point.</p>
      </header>
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
            {rows.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-green-700">Todo en orden.</TableCell></TableRow>
            : rows.map((r) => (
              <TableRow key={`${r.kind}-${r.id}`}>
                <TableCell><span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs">{r.kind === 'product' ? 'Producto' : 'Insumo'}</span></TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell className="text-right tabular-nums text-red-600">{r.stock} {r.unit ?? ''}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{r.reorderPoint}</TableCell>
                <TableCell className="text-right tabular-nums">{r.reorderPoint - r.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
