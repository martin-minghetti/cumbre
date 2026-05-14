'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createSupplierAction,
  updateSupplierAction,
  type ActionState,
} from '@/app/(admin)/admin/proveedores/actions';

type Supplier = {
  id: number;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cuit: string | null;
  notes: string | null;
};

const initial: ActionState = { ok: false, errors: [] };

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const action = supplier ? updateSupplierAction : createSupplierAction;
  const [state, formAction, pending] = useActionState(action, initial);

  function err(field: string): string | null {
    if (state.ok) return null;
    return state.errors?.find((e) => e.path?.includes(field))?.message ?? null;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {supplier ? <input type="hidden" name="id" value={supplier.id} /> : null}
      <Field label="Nombre" error={err('name')}>
        <Input name="name" defaultValue={supplier?.name ?? ''} required />
      </Field>
      <Field label="Contacto" error={err('contactName')}>
        <Input name="contactName" defaultValue={supplier?.contactName ?? ''} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" error={err('email')}>
          <Input name="email" type="email" defaultValue={supplier?.email ?? ''} />
        </Field>
        <Field label="Telefono" error={err('phone')}>
          <Input name="phone" defaultValue={supplier?.phone ?? ''} />
        </Field>
      </div>
      <Field label="Direccion" error={err('address')}>
        <Input name="address" defaultValue={supplier?.address ?? ''} />
      </Field>
      <Field label="CUIT" error={err('cuit')}>
        <Input name="cuit" defaultValue={supplier?.cuit ?? ''} />
      </Field>
      <Field label="Notas" error={err('notes')}>
        <Textarea name="notes" defaultValue={supplier?.notes ?? ''} rows={3} />
      </Field>
      {!state.ok && state.errors?.some((e) => !e.path) ? (
        <p className="text-sm text-red-600">{state.errors.find((e) => !e.path)?.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : supplier ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error: string | null; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
