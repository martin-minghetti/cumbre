import Link from 'next/link';
import type { Route } from 'next';
import { listProductsWithStock } from '@/lib/admin/products';
import { ProductosDataTable } from '@/components/admin/ProductosDataTable';
import { Button } from '@/components/ui/button';

export default async function ProductosListPage() {
  const products = await listProductsWithStock();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} productos en catálogo
          </p>
        </div>
        <Button asChild>
          <Link href={'/admin/productos/nuevo' as Route}>Nuevo producto</Link>
        </Button>
      </header>
      <ProductosDataTable products={products} />
    </div>
  );
}
