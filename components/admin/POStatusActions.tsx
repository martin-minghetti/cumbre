'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { transitionPurchaseOrderAction } from '@/app/(admin)/admin/compras/actions';
import type { POStatus } from '@/lib/admin/purchase-orders';

const NEXT: Record<POStatus, { to: POStatus; label: string; variant?: 'destructive' }[]> = {
  draft: [{ to: 'placed', label: 'Marcar enviada' }, { to: 'cancelled', label: 'Cancelar', variant: 'destructive' }],
  placed: [{ to: 'received', label: 'Marcar recibida (descuenta stock)' }, { to: 'cancelled', label: 'Cancelar', variant: 'destructive' }],
  received: [{ to: 'paid', label: 'Marcar pagada' }, { to: 'cancelled', label: 'Cancelar', variant: 'destructive' }],
  paid: [],
  cancelled: [],
};

export function POStatusActions({ poId, current }: { poId: number; current: POStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = NEXT[current];
  if (next.length === 0) return <p className="text-sm text-muted-foreground">Sin transiciones disponibles.</p>;

  function trigger(to: POStatus) {
    if (to === 'cancelled' && !confirm('Cancelar esta OC? Esta accion no se puede revertir.')) return;
    startTransition(async () => {
      const r = await transitionPurchaseOrderAction(poId, to);
      if (r.ok) {
        toast.success(`Estado actualizado a ${to}`);
        router.refresh();
      } else {
        toast.error(r.error ?? 'Error');
      }
    });
  }

  return (
    <div className="flex gap-2">
      {next.map((n) => (
        <Button key={n.to} variant={n.variant ?? 'default'} disabled={pending} onClick={() => trigger(n.to)}>
          {n.label}
        </Button>
      ))}
    </div>
  );
}
