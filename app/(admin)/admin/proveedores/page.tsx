import Link from 'next/link';
import type { Route } from 'next';
import { listSuppliers } from '@/lib/admin/suppliers';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function SuppliersPage() {
  const rows = await listSuppliers();
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Catalogo / Proveedores"
        title="Proveedores"
        subtitle="Contactos y CUIT de proveedores de insumos."
        actions={
          <Button asChild>
            <Link href={'/admin/proveedores/nuevo' as Route}>Nuevo proveedor</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Sin proveedores"
          helper="Carga proveedores para emitir ordenes de compra."
        />
      ) : (
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
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.contactName ?? ''}</TableCell>
                  <TableCell>{s.email ?? ''}</TableCell>
                  <TableCell className="font-mono tabular-nums">{s.cuit ?? ''}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/proveedores/${s.id}/edit` as Route}
                      className="text-primary text-sm"
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
