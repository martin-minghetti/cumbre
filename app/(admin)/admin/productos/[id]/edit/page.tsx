import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/ProductForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

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
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Catalogo / Editar producto"
        title={product.name.toUpperCase()}
        subtitle="Editor del producto. Cambios se publican al guardar."
      />
      <ProductForm product={product} />
    </div>
  );
}
