import Link from 'next/link';
import type { Route } from 'next';
import { listBatchesWithRemaining } from '@/lib/admin/batches';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';

export default async function ProduccionPage() {
  const batches = await listBatchesWithRemaining();
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Operaciones / Produccion"
        title="Produccion"
        subtitle={`Ultimos ${batches.length} batches. Listado completo en Batches.`}
        actions={
          <Button asChild>
            <Link href={'/admin/produccion/nuevo' as Route}>Registrar produccion</Link>
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground">
        Ver listado completo en{' '}
        <Link href={'/admin/batches' as Route} className="text-primary">
          Batches
        </Link>
        .
      </p>
    </div>
  );
}
