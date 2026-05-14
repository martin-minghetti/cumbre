import { SupplierForm } from '@/components/admin/SupplierForm';

export default function NewSupplierPage() {
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nuevo proveedor</h1>
      </header>
      <SupplierForm />
    </div>
  );
}
