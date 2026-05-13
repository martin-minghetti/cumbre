import {
  getMonthlyRevenueCents,
  getCriticalStockCount,
  getActiveBatchCount,
} from '@/lib/admin/dashboard';
import { KpiCard } from '@/components/admin/KpiCard';

function formatCentsToPesos(cents: number): string {
  const pesos = cents / 100;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(pesos);
}

export default async function DashboardPage() {
  const [revenue, criticalStock, activeBatches] = await Promise.all([
    getMonthlyRevenueCents(),
    getCriticalStockCount(),
    getActiveBatchCount(),
  ]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Ventas del mes"
          value={formatCentsToPesos(revenue)}
          helper="Suma de órdenes pagadas este mes"
        />
        <KpiCard
          label="Productos en stock crítico"
          value={String(criticalStock)}
          helper="Stock derivado < reorder_point"
          tone={criticalStock > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="Batches activos"
          value={String(activeBatches)}
          helper="Con stock remanente > 0"
        />
      </div>
    </div>
  );
}
