import { SupplyForm } from '@/components/admin/SupplyForm';

export default function NewSupplyPage() {
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nuevo insumo</h1>
      </header>
      <SupplyForm />
    </div>
  );
}
