import { notFound } from 'next/navigation';
import { getSupplyById } from '@/lib/admin/supplies';
import { SupplyForm } from '@/components/admin/SupplyForm';

export default async function EditSupplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const supply = await getSupplyById(id);
  if (!supply) notFound();
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{supply.name}</h1>
        <p className="text-sm text-muted-foreground">Editar insumo</p>
      </header>
      <SupplyForm supply={supply} />
    </div>
  );
}
