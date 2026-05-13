import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">Editar producto</p>
      </header>
      <ProductForm product={product} />
    </div>
  );
}
