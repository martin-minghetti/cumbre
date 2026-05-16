import { notFound } from 'next/navigation';
import { getPosSaleDetail } from '@/lib/admin/unified-sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export default async function PosSaleDetailPage({ params }: { params: Promise<{ posId: string }> }) {
  const { posId } = await params;
  const detail = await getPosSaleDetail(Number(posId));
  if (!detail) notFound();

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <Card>
        <CardHeader><CardTitle>Venta POS #{detail.sale.id}</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Cajero: {detail.sale.cashierName}</p>
          <p>Fecha: {new Date(detail.sale.createdAt).toLocaleString('es-AR')}</p>
          <p>Metodo: {detail.sale.paymentMethod}</p>
          <p>Sesion: #{detail.sale.cashSessionId}</p>
          <p className="text-lg font-semibold">{fmt(detail.sale.totalCents)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th>Producto</th><th>Pack</th><th>Qty</th><th className="text-right">Unitario</th><th className="text-right">Total</th><th>Lotes</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td>{it.productName}</td>
                  <td>{it.packSize === 1 ? 'unidad' : `x${it.packSize}`}</td>
                  <td>{it.qty}</td>
                  <td className="text-right tabular-nums">{fmt(it.unitPriceCents)}</td>
                  <td className="text-right tabular-nums">{fmt(it.lineTotalCents)}</td>
                  <td className="font-mono text-xs">{it.batchLotCodes.join(', ') || 's/d'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
