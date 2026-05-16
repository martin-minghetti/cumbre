import Link from 'next/link';
import type { Route } from 'next';
import { listBatchesWithRemaining } from '@/lib/admin/batches';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BatchStatusBadge } from '@/components/admin/Badge';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BatchesPage() {
  const rows = await listBatchesWithRemaining();
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Catalogo / Lotes"
        title="Batches"
        subtitle="Trazabilidad por lote: ABV, IBU, fecha envasado, costo."
        actions={
          <Button asChild>
            <Link href={'/admin/produccion/nuevo' as Route}>Registrar batch</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Sin batches"
          helper="Registra tu primer batch para comenzar la trazabilidad."
        />
      ) : (
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
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">{b.lotCode}</TableCell>
                  <TableCell>{b.productName}</TableCell>
                  <TableCell className="tabular-nums">{fmtDate(b.bottledAt)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.unitsProduced}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.remaining}</TableCell>
                  <TableCell><BatchStatusBadge status={b.status} /></TableCell>
                  <TableCell><Link href={`/admin/batches/${b.id}` as Route} className="text-primary text-sm">Ver</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
