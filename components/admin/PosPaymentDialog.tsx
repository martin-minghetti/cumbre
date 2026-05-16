'use client';
import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { submitPosSaleAction } from '@/app/(admin)/admin/pos/actions';
import type { CartLine } from './PosCart';
import { toast } from 'sonner';

const METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'mp_qr', label: 'MP QR' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n / 100);

export function PosPaymentDialog({
  open, onClose, cashSessionId, lines, totalCents, onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  cashSessionId: number;
  lines: CartLine[];
  totalCents: number;
  onSubmitted: (saleId: number) => void;
}) {
  const [method, setMethod] = useState<typeof METHODS[number]['value']>('cash');
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const r = await submitPosSaleAction({
        cashSessionId,
        paymentMethod: method,
        items: lines.map((l) => ({
          packDefinitionId: l.packDefinitionId,
          qty: l.qty,
          unitPriceCents: l.unitPriceCents,
        })),
      });
      if (r.ok) {
        toast.success(`Venta #${r.saleId} registrada (${fmt(r.totalCents)})`);
        onSubmitted(r.saleId);
      } else {
        toast.error(`Error: ${r.error}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cobrar {fmt(totalCents)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Metodo de pago</Label>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`rounded-md border p-3 text-sm ${method === m.value ? 'border-primary bg-primary/10' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button onClick={submit} disabled={isPending}>{isPending ? 'Procesando...' : 'Confirmar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
