'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { markOrderFulfilledAction } from '../actions';

export function MarkFulfilledButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(async () => {
        const r = await markOrderFulfilledAction(orderId);
        if (r.ok) { toast.success('Marcada como despachada'); router.refresh(); }
        else toast.error(r.error ?? 'Error');
      })}
    >
      {pending ? 'Procesando...' : 'Marcar despachada'}
    </Button>
  );
}
