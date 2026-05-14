'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { SupplySchema, createSupply, updateSupply } from '@/lib/admin/supplies';
import type { ZodIssue } from 'zod';

export type ActionState =
  | { ok: true }
  | { ok: false; errors: { path?: string[]; message: string }[] };

function parse(fd: FormData) {
  return SupplySchema.safeParse({
    name: fd.get('name'),
    unit: fd.get('unit'),
    reorderPoint: Number(fd.get('reorderPoint') ?? 0),
    currentQty: Number(fd.get('currentQty') ?? 0),
  });
}

function zodErrors(parsed: { error: { issues: ZodIssue[] } }) {
  return parsed.error.issues.map((i) => ({ path: i.path.map(String), message: i.message }));
}

export async function createSupplyAction(_prev: unknown, fd: FormData): Promise<ActionState> {
  const parsed = parse(fd);
  if (!parsed.success) {
    return { ok: false, errors: zodErrors(parsed) };
  }
  try {
    await createSupply(parsed.data);
  } catch (e) {
    console.error('[createSupply]', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
  revalidatePath('/admin/insumos');
  redirect('/admin/insumos' as Route);
}

export async function updateSupplyAction(_prev: unknown, fd: FormData): Promise<ActionState> {
  const id = Number(fd.get('id'));
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, errors: [{ path: ['id'], message: 'id invalido' }] };
  }
  const parsed = parse(fd);
  if (!parsed.success) {
    return { ok: false, errors: zodErrors(parsed) };
  }
  try {
    await updateSupply(id, parsed.data);
  } catch (e) {
    console.error('[updateSupply]', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
  revalidatePath('/admin/insumos');
  redirect('/admin/insumos' as Route);
}
