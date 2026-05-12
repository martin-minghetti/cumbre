'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  packId: number;
  productName: string;
  packLabel: string; // "Pack 6 · lata 473 ml"
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
};

export function CartLine({ packId, productName, packLabel, unitPriceCents, qty, lineTotalCents }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function update(newQty: number) {
    start(async () => {
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, qty: newQty }),
      });
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-start justify-between border-b border-paper/15 py-6">
      <div className="flex-1">
        <div className="font-display text-2xl uppercase tracking-tight text-paper">{productName}</div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">{packLabel}</div>
        <div className="mt-1 font-mono text-xs text-paper/50">${(unitPriceCents / 100).toLocaleString('es-AR')} c/u</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border border-paper/30 px-3 py-1">
          <button
            type="button"
            onClick={() => update(Math.max(0, qty - 1))}
            disabled={pending}
            className="text-paper hover:text-accent disabled:opacity-30"
            aria-label="restar"
          >
            −
          </button>
          <span className="w-6 text-center font-mono text-sm text-paper">{qty}</span>
          <button
            type="button"
            onClick={() => update(qty + 1)}
            disabled={pending}
            className="text-paper hover:text-accent disabled:opacity-30"
            aria-label="sumar"
          >
            +
          </button>
        </div>
        <div className="w-24 text-right font-mono text-sm text-paper">${(lineTotalCents / 100).toLocaleString('es-AR')}</div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 hover:text-accent"
        >
          quitar
        </button>
      </div>
    </div>
  );
}
