import Link from 'next/link';
import type { Route } from 'next';
import { listBatchesWithRemaining } from '@/lib/admin/batches';
import { Button } from '@/components/ui/button';

export default async function ProduccionPage() {
  const batches = await listBatchesWithRemaining();
  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Produccion</h1>
          <p className="text-sm text-muted-foreground">Ultimos {batches.length} batches</p>
        </div>
        <Button asChild>
          <Link href={'/admin/produccion/nuevo' as Route}>Registrar produccion</Link>
        </Button>
      </header>
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
