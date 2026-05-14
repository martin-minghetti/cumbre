'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupplyAction, updateSupplyAction, type ActionState } from '@/app/(admin)/admin/insumos/actions';

type Supply = { id: number; name: string; unit: string; reorderPoint: number; currentQty: number };
const initial: ActionState = { ok: false, errors: [] };

export function SupplyForm({ supply }: { supply?: Supply }) {
  const action = supply ? updateSupplyAction : createSupplyAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const err = (f: string) => (state.ok ? null : state.errors?.find((e) => e.path?.includes(f))?.message ?? null);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {supply ? <input type="hidden" name="id" value={supply.id} /> : null}
      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input name="name" defaultValue={supply?.name ?? ''} required />
        {err('name') ? <p className="text-sm text-red-600">{err('name')}</p> : null}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Unidad</Label>
          <Input name="unit" defaultValue={supply?.unit ?? 'kg'} required />
          {err('unit') ? <p className="text-sm text-red-600">{err('unit')}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Reorder point</Label>
          <Input name="reorderPoint" type="number" defaultValue={supply?.reorderPoint ?? 0} required min={0} />
          {err('reorderPoint') ? <p className="text-sm text-red-600">{err('reorderPoint')}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Stock actual</Label>
          <Input name="currentQty" type="number" defaultValue={supply?.currentQty ?? 0} required min={0} />
          {err('currentQty') ? <p className="text-sm text-red-600">{err('currentQty')}</p> : null}
        </div>
      </div>
      {!state.ok && state.errors?.some((e) => !e.path) ? (
        <p className="text-sm text-red-600">{state.errors.find((e) => !e.path)?.message}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : supply ? 'Guardar' : 'Crear'}
      </Button>
    </form>
  );
}
