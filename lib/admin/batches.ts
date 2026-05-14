import { db } from '@/db';
import { batches } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export type BatchRow = {
  id: number;
  productId: number;
  productName: string;
  lotCode: string;
  bottledAt: string;
  unitsProduced: number;
  remaining: number;
  costTotalCents: number;
  status: 'brewing' | 'bottled' | 'depleted';
};

export async function listBatchesWithRemaining(): Promise<BatchRow[]> {
  const r = await db.execute(sql`
    SELECT b.id, b.product_id AS "productId", p.name AS "productName",
      b.lot_code AS "lotCode", b.bottled_at AS "bottledAt",
      b.units_produced AS "unitsProduced",
      COALESCE((SELECT SUM(delta) FROM stock_movements WHERE batch_id = b.id), 0)::int AS remaining,
      b.cost_total_cents AS "costTotalCents",
      b.status
    FROM batches b
    JOIN products p ON p.id = b.product_id
    ORDER BY b.bottled_at DESC
  `);
  return r.rows as BatchRow[];
}

export async function getBatchById(id: number) {
  const rows = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
  return rows[0] ?? null;
}

export type BatchMovementRow = {
  id: number;
  delta: number;
  reason: string;
  referenceId: number | null;
  createdAt: string;
};

export async function listBatchMovements(batchId: number): Promise<BatchMovementRow[]> {
  const r = await db.execute(sql`
    SELECT id, delta, reason, reference_id AS "referenceId", created_at AS "createdAt"
    FROM stock_movements
    WHERE batch_id = ${batchId}
    ORDER BY created_at DESC
  `);
  return r.rows as BatchMovementRow[];
}

export type BatchSupplyConsumptionRow = {
  supplyId: number;
  supplyName: string;
  unit: string;
  qty: number;
};

export async function listBatchSupplyConsumption(batchId: number): Promise<BatchSupplyConsumptionRow[]> {
  const r = await db.execute(sql`
    SELECT sm.supply_id AS "supplyId", s.name AS "supplyName", s.unit, ABS(sm.delta)::int AS qty
    FROM supply_movements sm
    JOIN supplies s ON s.id = sm.supply_id
    WHERE sm.reason = 'production_consume' AND sm.reference_id = ${batchId}
    ORDER BY s.name
  `);
  return r.rows as BatchSupplyConsumptionRow[];
}
