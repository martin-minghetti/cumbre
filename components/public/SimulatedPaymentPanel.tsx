'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export function SimulatedPaymentPanel({ orderId }: { orderId: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function decide(decision: 'approve' | 'reject') {
    start(async () => {
      const r = await fetch(`/api/checkout/simulated/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.redirectUrl) router.push(j.redirectUrl as Route);
      else router.push('/carrito' as Route);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <button
        onClick={() => decide('approve')}
        disabled={pending}
        className="bg-accent px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-bg transition hover:bg-paper disabled:opacity-50"
      >
        {pending ? 'procesando…' : 'aprobar pago'}
      </button>
      <button
        onClick={() => decide('reject')}
        disabled={pending}
        className="border border-line-strong px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-text-inverse transition hover:border-accent hover:text-accent disabled:opacity-50"
      >
        rechazar
      </button>
    </div>
  );
}
