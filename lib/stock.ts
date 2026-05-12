import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { batches, stockMovements } from '@/db/schema';
import type { BatchAvailability } from '@/lib/fifo';

/**
 * Returns current available units per batch for a product, FIFO-sorted by bottled_at ASC.
 * Only includes batches with status='bottled' (brewing/depleted excluded).
 * available = SUM(stock_movements.delta) per batch.
 *
 * Caller should run this inside a transaction with SELECT FOR UPDATE on `batches` rows
 * to prevent concurrent oversell (see `applyOrderPaid` for the locking pattern).
 */
export async function getBatchesForProductFifo(productId: number): Promise<BatchAvailability[]> {
  const rows = await db
    .select({
      batchId: batches.id,
      available: sql<number>`COALESCE(SUM(${stockMovements.delta}), 0)::int`,
    })
    .from(batches)
    .leftJoin(stockMovements, eq(stockMovements.batchId, batches.id))
    .where(and(eq(batches.productId, productId), eq(batches.status, 'bottled')))
    .groupBy(batches.id, batches.bottledAt)
    .orderBy(asc(batches.bottledAt));

  return rows
    .filter((r) => r.available > 0)
    .map((r) => ({ batchId: r.batchId, available: r.available }));
}

/**
 * Total stock available for a product across all bottled batches.
 */
export async function getProductStock(productId: number): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${stockMovements.delta}), 0)::int`,
    })
    .from(stockMovements)
    .innerJoin(batches, eq(batches.id, stockMovements.batchId))
    .where(and(eq(batches.productId, productId), eq(batches.status, 'bottled')));
  return row?.total ?? 0;
}
