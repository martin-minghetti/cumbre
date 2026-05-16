import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cashSessions, posSales, posSaleItems, stockMovements } from '@/db/schema';
import { allocateFifo, InsufficientStockError } from '@/lib/fifo';
import { lockBatchesForProductsFifo } from '@/lib/order-paid/data';

export const posSaleSchema = z.object({
  cashSessionId: z.number().int().positive(),
  paymentMethod: z.enum(['cash', 'card', 'mp_qr', 'transfer']),
  customerId: z.number().int().positive().optional().nullable(),
  items: z
    .array(
      z.object({
        packDefinitionId: z.number().int().positive(),
        qty: z.number().int().positive(),
        unitPriceCents: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type PosSaleInput = z.infer<typeof posSaleSchema>;
export type CreatePosError = 'session_closed' | 'wrong_cashier' | 'insufficient_stock' | 'unknown_pack';

export async function createPosSale(input: PosSaleInput & { cashierId: number }): Promise<
  { ok: true; saleId: number; totalCents: number } | { ok: false; error: CreatePosError }
> {
  // 1) Pre-TX: validate session open + ownership.
  const [session] = await db
    .select({ id: cashSessions.id, closedAt: cashSessions.closedAt, openedBy: cashSessions.openedBy })
    .from(cashSessions)
    .where(eq(cashSessions.id, input.cashSessionId))
    .limit(1);
  if (!session) return { ok: false, error: 'session_closed' };
  if (session.closedAt) return { ok: false, error: 'session_closed' };
  if (session.openedBy !== input.cashierId) return { ok: false, error: 'wrong_cashier' };

  // 2) Resolve pack to product metadata.
  const packIds = input.items.map((i) => i.packDefinitionId);
  const packIdsList = sql.raw(`ARRAY[${packIds.join(',')}]::int[]`);
  const packsRes = await db.execute(sql`
    SELECT pd.id AS "packDefinitionId", pd.product_id AS "productId", pd.size AS "packSize", pd.price_cents AS "priceCents"
    FROM pack_definitions pd
    WHERE pd.id = ANY(${packIdsList})
  `);
  const packs = packsRes.rows as { packDefinitionId: number; productId: number; packSize: number; priceCents: number }[];
  if (packs.length !== packIds.length) return { ok: false, error: 'unknown_pack' };
  const packsById = new Map(packs.map((p) => [Number(p.packDefinitionId), p]));

  // Aggregate qty per product (units count) for FIFO allocation.
  const unitsPerProduct = new Map<number, number>();
  for (const it of input.items) {
    const meta = packsById.get(it.packDefinitionId)!;
    const units = it.qty * Number(meta.packSize);
    unitsPerProduct.set(meta.productId, (unitsPerProduct.get(meta.productId) ?? 0) + units);
  }
  const productIds = Array.from(unitsPerProduct.keys());

  const totalCents = input.items.reduce((acc, it) => acc + it.qty * it.unitPriceCents, 0);

  try {
    let saleId = 0;
    await db.transaction(async () => {
      const batchesByProduct = await lockBatchesForProductsFifo(productIds);

      const productAllocations = new Map<number, { batchId: number; qty: number }[]>();
      for (const pid of productIds) {
        const need = unitsPerProduct.get(pid) ?? 0;
        const productBatches = batchesByProduct.get(pid) ?? [];
        const allocations = allocateFifo(need, productBatches);
        productAllocations.set(pid, allocations);
      }

      const [saleRow] = await db
        .insert(posSales)
        .values({
          cashSessionId: input.cashSessionId,
          cashierId: input.cashierId,
          totalCents,
          paymentMethod: input.paymentMethod,
          customerId: input.customerId ?? null,
        })
        .returning({ id: posSales.id });
      saleId = saleRow.id;

      await db.insert(posSaleItems).values(
        input.items.map((it) => ({
          posSaleId: saleId,
          packDefinitionId: it.packDefinitionId,
          qty: it.qty,
          unitPriceCents: it.unitPriceCents,
        })),
      );

      const movements = [] as {
        productId: number;
        batchId: number;
        delta: number;
        reason: 'sale_pos';
        referenceId: number;
        createdBy: number;
      }[];
      for (const [productId, allocs] of productAllocations.entries()) {
        for (const a of allocs) {
          movements.push({
            productId,
            batchId: a.batchId,
            delta: -a.qty,
            reason: 'sale_pos',
            referenceId: saleId,
            createdBy: input.cashierId,
          });
        }
      }
      if (movements.length > 0) {
        await db.insert(stockMovements).values(movements);
      }
    });

    return { ok: true, saleId, totalCents };
  } catch (e) {
    if (e instanceof InsufficientStockError) {
      return { ok: false, error: 'insufficient_stock' };
    }
    throw e;
  }
}
