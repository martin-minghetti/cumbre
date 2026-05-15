'use server';

import { revalidatePath } from 'next/cache';
import {
  POSchema, createPurchaseOrder, transitionPurchaseOrder,
  InvalidTransitionError, type POStatus,
} from '@/lib/admin/purchase-orders';

export type CreateActionState =
  | { ok: true; poId: number }
  | { ok: false; errors: { path?: string[]; message: string }[] };

export async function createPurchaseOrderAction(_prev: unknown, fd: FormData): Promise<CreateActionState> {
  const supplierId = Number(fd.get('supplierId'));
  const items: { supplyId: number; qty: number; unitCostCents: number }[] = [];
  for (let i = 0; ; i++) {
    const sid = fd.get(`supplyId_${i}`);
    const qty = fd.get(`qty_${i}`);
    const cost = fd.get(`unitCost_${i}`);
    if (sid === null && qty === null && cost === null) break;
    if (sid && qty && cost) {
      items.push({ supplyId: Number(sid), qty: Number(qty), unitCostCents: Number(cost) });
    }
  }
  const parsed = POSchema.safeParse({ supplierId, items });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => ({ path: i.path.map(String), message: i.message })) };
  }
  try {
    const { poId } = await createPurchaseOrder(parsed.data);
    revalidatePath('/admin/compras');
    return { ok: true, poId };
  } catch (e) {
    console.error('[createPO]', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
}

export async function transitionPurchaseOrderAction(poId: number, to: POStatus): Promise<{ ok: boolean; error?: string }> {
  try {
    await transitionPurchaseOrder(poId, to);
    revalidatePath('/admin/compras');
    revalidatePath(`/admin/compras/${poId}`);
    revalidatePath('/admin/insumos');
    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    if (e instanceof InvalidTransitionError) return { ok: false, error: e.message };
    console.error('[transitionPO]', e);
    return { ok: false, error: 'Error al actualizar estado' };
  }
}
