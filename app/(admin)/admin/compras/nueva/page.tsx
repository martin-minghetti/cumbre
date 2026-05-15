import { db } from '@/db';
import { suppliers, supplies } from '@/db/schema';
import { PurchaseOrderForm } from '@/components/admin/PurchaseOrderForm';

export default async function NewPOPage() {
  const sup = await db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers).orderBy(suppliers.name);
  const sup2 = await db.select({ id: supplies.id, name: supplies.name, unit: supplies.unit }).from(supplies).orderBy(supplies.name);
  return (
    <div className="p-8 space-y-6">
      <header><h1 className="text-2xl font-semibold">Nueva orden de compra</h1></header>
      <PurchaseOrderForm suppliers={sup} supplies={sup2} />
    </div>
  );
}
