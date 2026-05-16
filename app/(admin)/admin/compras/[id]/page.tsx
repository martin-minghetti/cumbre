import { notFound } from 'next/navigation';
import { getPurchaseOrderWithItems } from '@/lib/admin/purchase-orders';
import { POStatusActions } from '@/components/admin/POStatusActions';
import { POStatusBadge } from '@/components/admin/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString('es-AR') : '-';

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const data = await getPurchaseOrderWithItems(id);
  if (!data) notFound();

  return (
    <div className="p-8 space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Orden de compra</p>
        <h1 className="text-2xl font-semibold font-mono tabular-nums">#{data.po.id}</h1>
        <p className="text-sm">Proveedor: {data.po.supplierName}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Estado</CardTitle></CardHeader>
          <CardContent><POStatusBadge status={data.po.status} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Enviada</CardTitle></CardHeader>
          <CardContent><div className="text-sm tabular-nums">{fmtDate(data.po.placedAt as unknown as string | null)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Recibida</CardTitle></CardHeader>
          <CardContent><div className="text-sm tabular-nums">{fmtDate(data.po.receivedAt as unknown as string | null)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold font-mono tabular-nums">{fmt(Number(data.po.totalCents))}</div></CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Items</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Costo unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.supplyName}</TableCell>
                  <TableCell className="text-right tabular-nums">{it.qty}</TableCell>
                  <TableCell>{it.unit}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(it.unitCostCents)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(it.qty * it.unitCostCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Acciones</h2>
        <POStatusActions poId={data.po.id} current={data.po.status} />
      </section>
    </div>
  );
}
