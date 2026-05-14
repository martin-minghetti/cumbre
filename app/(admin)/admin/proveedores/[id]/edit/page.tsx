import { notFound } from 'next/navigation';
import { getSupplierById } from '@/lib/admin/suppliers';
import { SupplierForm } from '@/components/admin/SupplierForm';

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const supplier = await getSupplierById(id);
  if (!supplier) notFound();
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{supplier.name}</h1>
        <p className="text-sm text-muted-foreground">Editar proveedor</p>
      </header>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
