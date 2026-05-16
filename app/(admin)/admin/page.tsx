import {
  getMonthlyRevenueCents,
  getCriticalStockCount,
  getActiveBatchCount,
} from '@/lib/admin/dashboard';
import { KpiCard } from '@/components/admin/KpiCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const dynamic = 'force-dynamic';

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
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Operaciones / Resumen"
        title="Dashboard"
        subtitle="Estado del mes en curso, stock al limite y batches con remanente."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Ventas del mes"
          value={formatCentsToPesos(revenue)}
          helper="Online + POS"
          tone="accent"
        />
        <KpiCard
          label="Stock critico"
          value={String(criticalStock)}
          helper={criticalStock === 0 ? 'Todo arriba del reorder point' : 'Productos bajo reorder point'}
          tone={criticalStock > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="Batches activos"
          value={String(activeBatches)}
          helper="Con stock remanente positivo"
        />
      </div>
    </div>
  );
}
