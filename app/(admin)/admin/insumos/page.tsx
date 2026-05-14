import Link from 'next/link';
import type { Route } from 'next';
import { listSupplies } from '@/lib/admin/supplies';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function SuppliesPage() {
  const rows = await listSupplies();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Insumos</h1>
          <p className="text-sm text-muted-foreground">{rows.length} insumos</p>
        </div>
        <Button asChild>
          <Link href={'/admin/insumos/nuevo' as Route}>Nuevo insumo</Link>
        </Button>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Stock actual</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Sin insumos.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => {
                const critical = s.currentQty < s.reorderPoint;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.unit}</TableCell>
                    <TableCell
                      className={
                        'text-right tabular-nums ' + (critical ? 'text-red-600 font-medium' : '')
                      }
                    >
                      {s.currentQty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {s.reorderPoint}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/insumos/${s.id}/edit` as Route}
                        className="text-primary text-sm"
                      >
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
