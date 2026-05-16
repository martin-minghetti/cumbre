'use client';
import { useState } from 'react';
import { PosCart, type CartLine } from './PosCart';
import type { PosCatalogRow } from '@/lib/admin/pos-catalog';

export function PosGrid({ catalog, cashSessionId }: { catalog: PosCatalogRow[]; cashSessionId: number }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addPack(p: PosCatalogRow, pack: PosCatalogRow['packs'][number]) {
    setLines((prev) => {
      const key = String(pack.packDefinitionId);
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, {
        key,
        packDefinitionId: pack.packDefinitionId,
        productId: p.productId,
        productName: p.productName,
        packSize: pack.size,
        unitPriceCents: pack.priceCents,
        qty: 1,
      }];
    });
  }

  function inc(key: string) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)));
  }
  function dec(key: string) {
    setLines((prev) =>
      prev.flatMap((l) => {
        if (l.key !== key) return [l];
        if (l.qty <= 1) return [];
        return [{ ...l, qty: l.qty - 1 }];
      }),
    );
  }
  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }
  function clearLines() {
    setLines([]);
  }

  return (
    <div className="grid grid-cols-[1fr_360px] h-full">
      <section className="overflow-y-auto p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {catalog.map((p) => (
            <article key={p.productId} className="rounded-lg border bg-card p-3 space-y-2">
              <header>
                <h3 className="font-semibold text-sm">{p.productName}</h3>
                <p className="text-xs text-muted-foreground">{p.style}, stock {p.stock}</p>
              </header>
              <div className="grid gap-1">
                {p.packs.map((pk) => (
                  <button
                    key={pk.packDefinitionId}
                    onClick={() => addPack(p, pk)}
                    className="rounded-md border bg-background px-3 py-2 text-left text-sm hover:bg-primary/10"
                  >
                    {pk.size === 1 ? 'Unidad' : `Pack x${pk.size}`}
                    <span className="float-right font-mono">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(pk.priceCents / 100)}
                    </span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <PosCart
        lines={lines}
        onInc={inc}
        onDec={dec}
        onRemove={removeLine}
        onClear={clearLines}
        cashSessionId={cashSessionId}
        onSubmitted={() => setLines([])}
      />
    </div>
  );
}
