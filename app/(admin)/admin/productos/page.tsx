import Link from 'next/link';
import type { Route } from 'next';
import { listProductsWithStock } from '@/lib/admin/products';
import { ProductosDataTable } from '@/components/admin/ProductosDataTable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';

export default async function ProductosListPage() {
  const products = await listProductsWithStock();
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Catalogo / Productos"
        title="Productos"
        subtitle="Catalogo activo, stock al instante."
        actions={
          <Button asChild>
            <Link href={'/admin/productos/nuevo' as Route}>Nuevo producto</Link>
          </Button>
        }
      />
      <ProductosDataTable products={products} />
    </div>
  );
}
