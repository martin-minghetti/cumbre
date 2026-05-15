import Link from 'next/link';
import type { Route } from 'next';
import { listPurchaseOrders } from '@/lib/admin/purchase-orders';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);

export default async function ComprasPage() {
  const rows = await listPurchaseOrders();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Ordenes de compra</h1>
          <p className="text-sm text-muted-foreground">{rows.length} ordenes registradas</p>
        </div>
        <Button asChild><Link href={'/admin/compras/nueva' as Route}>Nueva OC</Link></Button>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Sin ordenes.</TableCell></TableRow>
            ) : rows.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono">#{po.id}</TableCell>
                <TableCell>{po.supplierName}</TableCell>
                <TableCell><span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs">{po.status}</span></TableCell>
                <TableCell className="text-right tabular-nums">{fmt(Number(po.totalCents))}</TableCell>
                <TableCell><Link href={`/admin/compras/${po.id}` as Route} className="text-primary text-sm">Ver</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
