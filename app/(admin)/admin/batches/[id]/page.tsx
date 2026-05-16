import { notFound } from 'next/navigation';
import { getBatchById, listBatchMovements, listBatchSupplyConsumption } from '@/lib/admin/batches';
import { BatchStatusBadge } from '@/components/admin/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function fmtCents(c: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);
}

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const batch = await getBatchById(id);
  if (!batch) notFound();
  const [movements, consumption] = await Promise.all([
    listBatchMovements(id),
    listBatchSupplyConsumption(id),
  ]);

  return (
    <div className="p-8 space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Lote</p>
        <h1 className="text-2xl font-semibold font-mono">{batch.lotCode}</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Producidas</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold tabular-nums">{batch.unitsProduced}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Volumen (L)</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold tabular-nums">{batch.volumeProducedL}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Costo total</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold font-mono tabular-nums">{fmtCents(Number(batch.costTotalCents))}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Estado</CardTitle></CardHeader><CardContent><BatchStatusBadge status={batch.status} /></CardContent></Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Insumos consumidos</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Insumo</TableHead><TableHead>Cantidad</TableHead><TableHead>Unidad</TableHead></TableRow></TableHeader>
            <TableBody>
              {consumption.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Sin registro de consumo.</TableCell></TableRow>
              ) : consumption.map((c) => (
                <TableRow key={c.supplyId}><TableCell>{c.supplyName}</TableCell><TableCell className="tabular-nums">{c.qty}</TableCell><TableCell>{c.unit}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Movimientos de stock</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Delta</TableHead><TableHead>Motivo</TableHead><TableHead>Ref</TableHead></TableRow></TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Sin movimientos.</TableCell></TableRow>
              ) : movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm tabular-nums">{new Date(m.createdAt).toLocaleString('es-AR')}</TableCell>
                  <TableCell className={'font-mono tabular-nums ' + (m.delta < 0 ? 'text-red-600' : 'text-green-700')}>{m.delta > 0 ? `+${m.delta}` : m.delta}</TableCell>
                  <TableCell>{m.reason}</TableCell>
                  <TableCell className="text-muted-foreground font-mono tabular-nums">{m.referenceId ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
