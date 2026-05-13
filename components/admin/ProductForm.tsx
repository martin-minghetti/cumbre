'use client';

import { useActionState, useEffect } from 'react';
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
import { updateProduct, type ActionState } from '@/app/(admin)/admin/productos/[id]/edit/actions';

type Product = {
  id: number;
  name: string;
  style: string;
  format: 'lata_473' | 'porron_1l';
  abvDefault: number | null;
  ibuDefault: number | null;
  description: string | null;
  heroImageUrl: string | null;
  reorderPoint: number;
  active: boolean;
};

const initialState: ActionState = { ok: false, errors: [] } as ActionState;

export function ProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateProduct, initialState);

  useEffect(() => {
    if (state.ok) {
      toast.success('Producto actualizado');
      router.push('/admin/productos' as Route);
    }
  }, [state, router]);

  function errorFor(field: string): string | null {
    if (state.ok) return null;
    const e = state.errors?.find((er) => er.path?.includes(field));
    return e?.message ?? null;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <input type="hidden" name="id" value={product.id} />

      <Field label="Nombre" error={errorFor('name')}>
        <Input name="name" defaultValue={product.name} required />
      </Field>

      <Field label="Estilo" error={errorFor('style')}>
        <Input name="style" defaultValue={product.style} required />
      </Field>

      <Field label="Formato" error={errorFor('format')}>
        <Select name="format" defaultValue={product.format}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lata_473">Lata 473ml</SelectItem>
            <SelectItem value="porron_1l">Porron 1L</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="ABV × 10 (opcional)" error={errorFor('abvDefault')}>
          <Input
            type="number"
            name="abvDefault"
            defaultValue={product.abvDefault ?? ''}
            min={0}
            max={200}
          />
        </Field>
        <Field label="IBU (opcional)" error={errorFor('ibuDefault')}>
          <Input
            type="number"
            name="ibuDefault"
            defaultValue={product.ibuDefault ?? ''}
            min={0}
            max={200}
          />
        </Field>
      </div>

      <Field label="Descripción" error={errorFor('description')}>
        <Textarea name="description" defaultValue={product.description ?? ''} rows={4} />
      </Field>

      <Field label="Hero image URL" error={errorFor('heroImageUrl')}>
        <Input name="heroImageUrl" defaultValue={product.heroImageUrl ?? ''} type="url" />
      </Field>

      <Field label="Reorder point" error={errorFor('reorderPoint')}>
        <Input
          type="number"
          name="reorderPoint"
          defaultValue={product.reorderPoint}
          required
          min={0}
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          name="active"
          defaultChecked={product.active}
          className="size-4"
        />
        <Label htmlFor="active">Producto activo (visible en catálogo público)</Label>
      </div>

      {!state.ok && state.errors && state.errors.some((e) => !e.path) ? (
        <p className="text-sm text-red-600">
          {state.errors.find((e) => !e.path)?.message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/productos' as Route)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
