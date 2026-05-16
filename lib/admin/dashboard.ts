import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function getMonthlyRevenueCents(): Promise<number> {
  const r = await db.execute(sql`
    SELECT (
      COALESCE((SELECT SUM(total_cents) FROM orders WHERE status IN ('paid','fulfilled') AND created_at >= date_trunc('month', NOW())), 0)
      +
      COALESCE((SELECT SUM(total_cents) FROM pos_sales WHERE created_at >= date_trunc('month', NOW())), 0)
    )::bigint AS total
  `);
  const total = (r.rows[0] as { total: string | number | null })?.total;
  return total ? Number(total) : 0;
}

export async function getCriticalStockCount(): Promise<number> {
  const r = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM products p
    LEFT JOIN (
      SELECT product_id, COALESCE(SUM(delta), 0) AS stock
      FROM stock_movements
      GROUP BY product_id
    ) sm ON sm.product_id = p.id
    WHERE p.active = true
      AND COALESCE(sm.stock, 0) < p.reorder_point
  `);
  const count = (r.rows[0] as { count: string | number })?.count;
  return Number(count ?? 0);
}

export async function getActiveBatchCount(): Promise<number> {
  const r = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM batches b
    WHERE EXISTS (
      SELECT 1 FROM (
        SELECT batch_id, SUM(delta) AS remaining
        FROM stock_movements
        WHERE batch_id IS NOT NULL
        GROUP BY batch_id
        HAVING SUM(delta) > 0
      ) r WHERE r.batch_id = b.id
    )
  `);
  const count = (r.rows[0] as { count: string | number })?.count;
  return Number(count ?? 0);
}
