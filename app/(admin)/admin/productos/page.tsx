import { listProductsWithStock } from '@/lib/admin/products';
import { ProductosDataTable } from '@/components/admin/ProductosDataTable';

export default async function ProductosListPage() {
  const products = await listProductsWithStock();
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} productos en catálogo
        </p>
      </header>
      <ProductosDataTable products={products} />
    </div>
  );
}
