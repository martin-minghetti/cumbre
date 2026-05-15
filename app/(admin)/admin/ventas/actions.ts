'use server';

import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function markOrderFulfilledAction(orderId: number): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isFinite(orderId) || orderId <= 0) return { ok: false, error: 'invalid id' };
  try {
    await db.update(orders).set({ status: 'fulfilled', fulfilledAt: new Date() }).where(eq(orders.id, orderId));
    revalidatePath('/admin/ventas');
    revalidatePath(`/admin/ventas/${orderId}`);
    return { ok: true };
  } catch (e) {
    console.error('[markFulfilled]', e);
    return { ok: false, error: 'db error' };
  }
}
