'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fmtPrice } from '@/lib/products';

type Pack = { id: number; size: number; priceCents: number };

type Props = {
  packs: Pack[];
};

function packLabel(size: number): string {
  return size === 1 ? 'Unidad' : `Pack ${size}`;
}

function packSub(size: number): string {
  return `×${size}`;
}

export function BuyBlock({ packs }: Props) {
  const sorted = useMemo(() => [...packs].sort((a, b) => a.size - b.size), [packs]);
  const single = sorted.find((p) => p.size === 1);
  const initial = sorted[0];
  const [selectedId, setSelectedId] = useState<number>(initial?.id ?? 0);
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const selected = sorted.find((p) => p.id === selectedId) ?? initial;

  function discountLabel(pack: Pack): string | null {
    if (!single || pack.size === 1) return null;
    const unitFromBulk = pack.priceCents / pack.size;
    const discount = (single.priceCents - unitFromBulk) / single.priceCents;
    if (discount <= 0.005) return null;
    return `−${Math.round(discount * 100)}%`;
  }

  function add() {
    if (!selected) return;
    start(async () => {
      const r = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selected.id, qty: 1 }),
      });
      if (r.ok) {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 1500);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">Pack</span>
        <div className="flex gap-2">
          {sorted.map((pack) => {
            const active = pack.id === selected?.id;
            const discount = discountLabel(pack);
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedId(pack.id)}
                aria-pressed={active}
                className={`flex-1 border px-3 py-3.5 text-center font-display text-[18px] uppercase tracking-[0.01em] transition ${
                  active
                    ? 'border-accent bg-accent text-bg'
                    : 'border-line text-text-inverse hover:border-accent hover:text-accent'
                }`}
              >
                {packLabel(pack.size)}
                <small className="mt-0.5 block font-mono text-[10px] tracking-[0.18em] opacity-70">
                  {discount ?? packSub(pack.size)}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-end gap-8 border-t border-line pt-[18px]">
        <div>
          <div className="font-display text-[64px] leading-[1] tracking-[0.005em]">
            {selected ? fmtPrice(selected.priceCents) : '-'}
            <small className="ml-1.5 font-mono text-[12px] uppercase tracking-[0.2em] text-muted">ARS</small>
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="text-accent">▲ </span>Envío Bariloche 24 h · Retiro en taproom gratis
          </p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="inline-flex items-center justify-center bg-accent px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-bg transition hover:bg-paper disabled:opacity-50"
          >
            {added ? '✓ agregado' : pending ? 'agregando...' : `Agregar · ${fmtPrice(selected.priceCents)}`}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="bg-accent px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] text-bg opacity-30"
          >
            Sin stock
          </button>
        )}
      </div>
    </>
  );
}
