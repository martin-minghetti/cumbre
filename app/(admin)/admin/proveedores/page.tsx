import Link from 'next/link';
import type { Route } from 'next';
import { listSuppliers } from '@/lib/admin/suppliers';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function SuppliersPage() {
  const rows = await listSuppliers();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Proveedores</h1>
          <p className="text-sm text-muted-foreground">{rows.length} proveedores</p>
        </div>
        <Button asChild>
          <Link href={'/admin/proveedores/nuevo' as Route}>Nuevo proveedor</Link>
        </Button>
      </header>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Sin proveedores.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.contactName ?? ''}</TableCell>
                  <TableCell>{s.email ?? ''}</TableCell>
                  <TableCell className="tabular-nums">{s.cuit ?? ''}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/proveedores/${s.id}/edit` as Route}
                      className="text-primary text-sm"
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
