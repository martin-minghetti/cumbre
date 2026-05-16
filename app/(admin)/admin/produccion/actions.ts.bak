'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { produceBatch, ProductionInsufficientSupplyError } from '@/lib/admin/production';

export type ActionState =
  | { ok: true; batchId: number }
  | { ok: false; errors: { path?: string[]; message: string }[] };

export async function produceBatchAction(_prev: unknown, formData: FormData): Promise<ActionState> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value ?? null;
  const session = token ? await verifySession(token) : null;
  const createdBy = session?.userId ?? 1;

  const productId = Number(formData.get('productId'));
  const lotCode = String(formData.get('lotCode') ?? '').trim();
  const bottledAt = new Date(String(formData.get('bottledAt') ?? ''));
  const abv = formData.get('abv') ? Number(formData.get('abv')) : null;
  const ibu = formData.get('ibu') ? Number(formData.get('ibu')) : null;
  const volumeProducedL = Number(formData.get('volumeProducedL'));
  const unitsProduced = Number(formData.get('unitsProduced'));
  const costTotalCents = Number(formData.get('costTotalCents'));
  const notes = (formData.get('notes') as string) || null;

  // Parse consumption rows: supplyId_0, qty_0, supplyId_1, qty_1, ...
  const consumption: { supplyId: number; qty: number }[] = [];
  for (let i = 0; ; i++) {
    const sid = formData.get(`supplyId_${i}`);
    const qty = formData.get(`qty_${i}`);
    if (sid === null && qty === null) break;
    if (sid && qty) {
      const sN = Number(sid);
      const qN = Number(qty);
      if (Number.isFinite(sN) && Number.isFinite(qN) && qN > 0) {
        consumption.push({ supplyId: sN, qty: qN });
      }
    }
  }

  try {
    const { batchId } = await produceBatch({
      productId,
      lotCode,
      bottledAt,
      abv,
      ibu,
      volumeProducedL,
      unitsProduced,
      costTotalCents,
      notes,
      consumption,
      createdBy,
    });
    revalidatePath('/admin/batches');
    revalidatePath('/admin/produccion');
    revalidatePath('/admin/insumos');
    revalidatePath('/admin');
    return { ok: true, batchId };
  } catch (e) {
    if (e instanceof ProductionInsufficientSupplyError) {
      return {
        ok: false,
        errors: [
          {
            message: `Insumo ${e.supplyId}: requiere ${e.required}, disponible ${e.available}`,
          },
        ],
      };
    }
    console.error('[produceBatch]', e);
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return { ok: false, errors: [{ message: msg }] };
  }
}
