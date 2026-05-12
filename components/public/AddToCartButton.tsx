'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  packId: number;
  label: string;
  variant?: 'primary' | 'secondary';
};

export function AddToCartButton({ packId, label, variant = 'primary' }: Props) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const base =
    'inline-flex items-center justify-center px-12 py-5 font-display text-[16px] uppercase tracking-[0.06em] transition disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-accent text-bg hover:bg-paper'
      : 'border border-line-strong text-text-inverse hover:border-accent hover:text-accent';

  function add() {
    start(async () => {
      const r = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, qty: 1 }),
      });
      if (r.ok) {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 1500);
      }
    });
  }

  return (
    <button type="button" onClick={add} disabled={pending} className={`${base} ${styles}`}>
      {added ? '✓ agregado' : pending ? 'agregando…' : label}
    </button>
  );
}
