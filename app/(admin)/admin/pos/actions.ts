'use server';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@/lib/auth/current-user';
import { createPosSale, posSaleSchema } from '@/lib/admin/pos-sale';

export type SubmitResult =
  | { ok: true; saleId: number; totalCents: number }
  | { ok: false; error: string };

export async function submitPosSaleAction(payload: unknown): Promise<SubmitResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'auth_required' };
  if (user.role !== 'cashier' && user.role !== 'owner') return { ok: false, error: 'forbidden' };

  const parsed = posSaleSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'invalid_payload' };

  const r = await createPosSale({ ...parsed.data, cashierId: user.id });
  if (!r.ok) return { ok: false, error: r.error };

  revalidatePath('/admin/pos');
  revalidatePath('/admin/caja');
  revalidatePath('/admin/ventas');
  return { ok: true, saleId: r.saleId, totalCents: r.totalCents };
}
