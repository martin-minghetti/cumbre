import { getTopProducts } from '@/lib/admin/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function TopProductosPage() {
  const rows = await getTopProducts(30, 10);
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Top 10 productos</h1>
        <p className="text-sm text-muted-foreground">Ultimos 30 dias, ordenado por revenue.</p>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>#</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Unidades</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8">Sin datos.</TableCell></TableRow>
            : rows.map((r, i) => (
              <TableRow key={r.productId}>
                <TableCell className="tabular-nums text-muted-foreground">{i + 1}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell className="text-right tabular-nums">{r.units}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.revenueCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
