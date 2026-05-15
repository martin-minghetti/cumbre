import { notFound } from 'next/navigation';
import { getOrderDetail } from '@/lib/admin/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MarkFulfilledButton } from './MarkFulfilledButton';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString('es-AR') : '-';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const data = await getOrderDetail(id);
  if (!data) notFound();

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">Orden</p>
          <h1 className="text-2xl font-semibold font-mono">#{data.order.id}</h1>
          <p className="text-sm">{data.customer.name} ({data.customer.email})</p>
        </div>
        {data.order.status === 'paid' ? <MarkFulfilledButton orderId={data.order.id} /> : null}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Estado</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{data.order.status}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Creada</CardTitle></CardHeader><CardContent><div className="text-sm">{fmtDate(data.order.createdAt)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Pagada</CardTitle></CardHeader><CardContent><div className="text-sm">{fmtDate(data.order.paidAt)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{fmt(data.order.totalCents)}</div></CardContent></Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Items</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Pack</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Lotes</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.productName}</TableCell>
                  <TableCell>{it.packSize === 1 ? 'Unidad' : `Pack ${it.packSize}`}</TableCell>
                  <TableCell className="text-right tabular-nums">{it.qty}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(it.unitPriceCents)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(it.lineTotalCents)}</TableCell>
                  <TableCell className="font-mono text-xs">{it.batchLotCodes.length > 0 ? it.batchLotCodes.join(', ') : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
