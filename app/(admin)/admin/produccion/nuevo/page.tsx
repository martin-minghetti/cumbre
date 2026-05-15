import { db } from '@/db';
import { products, supplies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProductionForm } from '@/components/admin/ProductionForm';

export default async function NewProductionPage() {
  const ps = await db
    .select({
      id: products.id,
      name: products.name,
      style: products.style,
      format: products.format,
    })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(products.name);

  const ss = await db
    .select({
      id: supplies.id,
      name: supplies.name,
      unit: supplies.unit,
      currentQty: supplies.currentQty,
    })
    .from(supplies)
    .orderBy(supplies.name);

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nueva produccion</h1>
        <p className="text-sm text-muted-foreground">
          Registra un batch nuevo y descuenta insumos automaticamente.
        </p>
      </header>
      <ProductionForm products={ps} supplies={ss} />
    </div>
  );
}
