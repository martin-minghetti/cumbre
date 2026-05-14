import Link from 'next/link';
import type { Route } from 'next';
import { listBatchesWithRemaining } from '@/lib/admin/batches';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function statusBadge(s: 'brewing' | 'bottled' | 'depleted') {
  const colors: Record<typeof s, string> = {
    brewing: 'bg-amber-100 text-amber-800',
    bottled: 'bg-green-100 text-green-800',
    depleted: 'bg-gray-200 text-gray-600',
  };
  return <span className={'inline-flex rounded-md px-2 py-1 text-xs ' + colors[s]}>{s}</span>;
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BatchesPage() {
  const rows = await listBatchesWithRemaining();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Batches</h1>
          <p className="text-sm text-muted-foreground">{rows.length} lotes registrados</p>
        </div>
        <Button asChild><Link href={'/admin/produccion/nuevo' as Route}>Registrar batch</Link></Button>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Envasado</TableHead>
              <TableHead className="text-right">Producidas</TableHead>
              <TableHead className="text-right">Restantes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Sin batches.</TableCell></TableRow>
            ) : rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-sm">{b.lotCode}</TableCell>
                <TableCell>{b.productName}</TableCell>
                <TableCell>{fmtDate(b.bottledAt)}</TableCell>
                <TableCell className="text-right tabular-nums">{b.unitsProduced}</TableCell>
                <TableCell className="text-right tabular-nums">{b.remaining}</TableCell>
                <TableCell>{statusBadge(b.status)}</TableCell>
                <TableCell><Link href={`/admin/batches/${b.id}` as Route} className="text-primary text-sm">Ver</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
