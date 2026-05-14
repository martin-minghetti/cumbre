'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { SupplierSchema, createSupplier, updateSupplier } from '@/lib/admin/suppliers';
import type { ZodIssue } from 'zod';

export type ActionState =
  | { ok: true }
  | { ok: false; errors: { path?: string[]; message: string }[] };

function parseFormData(formData: FormData) {
  return SupplierSchema.safeParse({
    name: formData.get('name'),
    contactName: formData.get('contactName') ?? null,
    email: formData.get('email') ?? null,
    phone: formData.get('phone') ?? null,
    address: formData.get('address') ?? null,
    cuit: formData.get('cuit') ?? null,
    notes: formData.get('notes') ?? null,
  });
}

function zodErrors(parsed: { error: { issues: ZodIssue[] } }) {
  return parsed.error.issues.map((i) => ({ path: i.path.map(String), message: i.message }));
}

export async function createSupplierAction(_prev: unknown, formData: FormData): Promise<ActionState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed) };
  try {
    await createSupplier(parsed.data);
  } catch (e) {
    console.error('[createSupplier]', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
  revalidatePath('/admin/proveedores');
  redirect('/admin/proveedores' as Route);
}

export async function updateSupplierAction(_prev: unknown, formData: FormData): Promise<ActionState> {
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, errors: [{ path: ['id'], message: 'id invalido' }] };
  }
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed) };
  try {
    await updateSupplier(id, parsed.data);
  } catch (e) {
    console.error('[updateSupplier]', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
  revalidatePath('/admin/proveedores');
  redirect('/admin/proveedores' as Route);
}
