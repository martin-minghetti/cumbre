'use client';
import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPurchaseOrderAction, type CreateActionState } from '@/app/(admin)/admin/compras/actions';
import type { Route } from 'next';

type Supplier = { id: number; name: string };
type Supply = { id: number; name: string; unit: string };
const initial: CreateActionState = { ok: false, errors: [] };

export function PurchaseOrderForm({ suppliers, supplies }: { suppliers: Supplier[]; supplies: Supply[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createPurchaseOrderAction, initial);
  const [rows, setRows] = useState<{ key: number }[]>([{ key: 0 }]);

  useEffect(() => {
    if (state.ok) {
      toast.success(`OC #${state.poId} creada`);
      router.push(`/admin/compras/${state.poId}` as Route);
    } else if (state.errors?.length) {
      toast.error(state.errors[0].message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <div className="space-y-1">
        <Label>Proveedor</Label>
        <Select name="supplierId" required>
          <SelectTrigger><SelectValue placeholder="Elegi proveedor" /></SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows([...rows, { key: Date.now() }])}>+ Item</Button>
        </div>
        {rows.map((row, i) => (
          <div key={row.key} className="grid grid-cols-[1fr_120px_160px_auto] gap-2">
            <Select name={`supplyId_${i}`}>
              <SelectTrigger><SelectValue placeholder="Insumo" /></SelectTrigger>
              <SelectContent>
                {supplies.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.unit})</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name={`qty_${i}`} type="number" min={1} placeholder="qty" />
            <Input name={`unitCost_${i}`} type="number" min={0} placeholder="centavos/unidad" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>X</Button>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={pending}>{pending ? 'Creando...' : 'Crear OC'}</Button>
    </form>
  );
}
