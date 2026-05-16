'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PosPaymentDialog } from './PosPaymentDialog';

export type CartLine = {
  key: string;
  packDefinitionId: number;
  productId: number;
  productName: string;
  packSize: number;
  unitPriceCents: number;
  qty: number;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export function PosCart({
  lines, onInc, onDec, onRemove, onClear, cashSessionId, onSubmitted,
}: {
  lines: CartLine[];
  onInc: (key: string) => void;
  onDec: (key: string) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  cashSessionId: number;
  onSubmitted: (saleId: number) => void;
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const total = lines.reduce((acc, l) => acc + l.qty * l.unitPriceCents, 0);
  const totalUnits = lines.reduce((acc, l) => acc + l.qty * l.packSize, 0);

  return (
    <aside className="flex flex-col h-full border-l bg-card">
      <header className="border-b p-4">
        <h2 className="font-semibold">Ticket en curso</h2>
        <p className="text-xs text-muted-foreground">{lines.length} lineas, {totalUnits} unidades</p>
      </header>
      <ul className="flex-1 overflow-y-auto divide-y">
        {lines.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">Sin items. Toca productos para sumarlos.</li>
        )}
        {lines.map((l) => (
          <li key={l.key} className="p-3 space-y-2">
            <div className="flex justify-between gap-2">
              <span className="text-sm font-medium">{l.productName}</span>
              <button className="text-xs text-destructive" onClick={() => onRemove(l.key)}>quitar</button>
            </div>
            <div className="text-xs text-muted-foreground">{l.packSize === 1 ? 'unidad' : `pack x${l.packSize}`}, {fmt(l.unitPriceCents)}</div>
            <div className="flex items-center gap-2">
              <button className="size-7 rounded border" onClick={() => onDec(l.key)} aria-label="restar">-</button>
              <span className="font-mono w-8 text-center">{l.qty}</span>
              <button className="size-7 rounded border" onClick={() => onInc(l.key)} aria-label="sumar">+</button>
              <span className="ml-auto font-mono">{fmt(l.qty * l.unitPriceCents)}</span>
            </div>
          </li>
        ))}
      </ul>
      <footer className="border-t p-4 space-y-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="font-mono">{fmt(total)}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={lines.length === 0} onClick={onClear}>Vaciar</Button>
          <Button className="flex-1" disabled={lines.length === 0} onClick={() => setOpenDialog(true)}>Cobrar</Button>
        </div>
      </footer>
      <PosPaymentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        cashSessionId={cashSessionId}
        lines={lines}
        totalCents={total}
        onSubmitted={(id) => { setOpenDialog(false); onSubmitted(id); }}
      />
    </aside>
  );
}
