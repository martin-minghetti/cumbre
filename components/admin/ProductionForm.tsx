'use client';
import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  produceBatchAction,
  type ActionState,
} from '@/app/(admin)/admin/produccion/actions';

type Product = { id: number; name: string; style: string; format: string };
type Supply = { id: number; name: string; unit: string; currentQty: number };

const initial: ActionState = { ok: false, errors: [] };

export function ProductionForm({
  products,
  supplies,
}: {
  products: Product[];
  supplies: Supply[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(produceBatchAction, initial);
  const [rows, setRows] = useState<{ key: number }[]>([{ key: 0 }]);

  useEffect(() => {
    if (state.ok) {
      toast.success(`Batch creado (id ${state.batchId})`);
      router.push('/admin/batches' as Route);
    } else if (state.errors?.length) {
      toast.error(state.errors[0].message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Producto</Label>
          <Select name="productId" required>
            <SelectTrigger>
              <SelectValue placeholder="Elegi producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.style})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Lote (lot_code)</Label>
          <Input name="lotCode" required placeholder="IPA-260514-01" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Fecha envasado</Label>
          <Input name="bottledAt" type="datetime-local" required />
        </div>
        <div className="space-y-1">
          <Label>ABV x10 (opcional)</Label>
          <Input name="abv" type="number" min={0} max={200} />
        </div>
        <div className="space-y-1">
          <Label>IBU (opcional)</Label>
          <Input name="ibu" type="number" min={0} max={200} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Volumen (L)</Label>
          <Input name="volumeProducedL" type="number" min={1} required />
        </div>
        <div className="space-y-1">
          <Label>Unidades producidas</Label>
          <Input name="unitsProduced" type="number" min={1} required />
        </div>
        <div className="space-y-1">
          <Label>Costo total (centavos)</Label>
          <Input name="costTotalCents" type="number" min={0} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notas</Label>
        <Textarea name="notes" rows={2} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Insumos consumidos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRows([...rows, { key: Date.now() }])}
          >
            + Agregar
          </Button>
        </div>
        {rows.map((row, i) => (
          <div key={row.key} className="grid grid-cols-[1fr_120px_auto] gap-2">
            <Select name={`supplyId_${i}`}>
              <SelectTrigger>
                <SelectValue placeholder="Insumo" />
              </SelectTrigger>
              <SelectContent>
                {supplies.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} (stock: {s.currentQty} {s.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name={`qty_${i}`}
              type="number"
              min={0}
              step="any"
              placeholder="qty"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
            >
              X
            </Button>
          </div>
        ))}
      </div>

      {!state.ok && state.errors?.length ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.errors.map((e, i) => (
            <div key={i}>{e.message}</div>
          ))}
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Produciendo...' : 'Registrar produccion'}
      </Button>
    </form>
  );
}
