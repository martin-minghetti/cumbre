'use client';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProductAction, type CreateActionState } from './actions';

const initial: CreateActionState = { ok: false, errors: [] };

export default function NewProductPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createProductAction, initial);
  useEffect(() => {
    if (state.ok) {
      toast.success('Producto creado');
      router.push('/admin/productos' as Route);
    } else if (state.errors?.length) {
      toast.error(state.errors[0].message);
    }
  }, [state, router]);

  const err = (f: string) => (state.ok ? null : state.errors?.find((e) => e.path?.includes(f))?.message ?? null);

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">El slug se genera automaticamente. Se crea 1 pack default (unidad).</p>
      </header>
      <form action={formAction} className="space-y-4 max-w-2xl">
        <div className="space-y-1">
          <Label>Nombre</Label>
          <Input name="name" required />
          {err('name') ? <p className="text-sm text-red-600">{err('name')}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Estilo</Label>
            <Input name="style" required placeholder="IPA, Stout, Helles..." />
            {err('style') ? <p className="text-sm text-red-600">{err('style')}</p> : null}
          </div>
          <div className="space-y-1">
            <Label>Formato</Label>
            <Select name="format" required>
              <SelectTrigger><SelectValue placeholder="Elegi formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lata_473">Lata 473ml</SelectItem>
                <SelectItem value="porron_1l">Porron 1L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ABV x10 (opcional)</Label>
            <Input name="abvDefault" type="number" min={0} max={200} />
          </div>
          <div className="space-y-1">
            <Label>IBU (opcional)</Label>
            <Input name="ibuDefault" type="number" min={0} max={200} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Descripcion</Label>
          <Textarea name="description" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Reorder point</Label>
            <Input name="reorderPoint" type="number" min={0} defaultValue={50} required />
            {err('reorderPoint') ? <p className="text-sm text-red-600">{err('reorderPoint')}</p> : null}
          </div>
          <div className="space-y-1">
            <Label>Precio default (centavos)</Label>
            <Input name="defaultPriceCents" type="number" min={1} required />
            {err('defaultPriceCents') ? <p className="text-sm text-red-600">{err('defaultPriceCents')}</p> : null}
          </div>
        </div>
        <Button type="submit" disabled={pending}>{pending ? 'Creando...' : 'Crear producto'}</Button>
      </form>
    </div>
  );
}
