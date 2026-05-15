import { db } from '@/db';
import { sql } from 'drizzle-orm';

export type MarginRow = {
  productId: number;
  productName: string;
  revenueCents: number;
  costCents: number;
  marginCents: number;
  marginPct: number;
};

export async function getMarginByProduct(rangeDays = 30): Promise<MarginRow[]> {
  const r = await db.execute(sql`
    WITH sold AS (
      SELECT pd.product_id,
        SUM(oi.line_total_cents)::bigint AS revenue,
        SUM(oi.qty * pd.size) AS units_sold
      FROM order_items oi
      JOIN pack_definitions pd ON pd.id = oi.pack_definition_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status IN ('paid', 'fulfilled')
        AND o.created_at >= NOW() - (${rangeDays} || ' days')::interval
      GROUP BY pd.product_id
    ),
    cost AS (
      SELECT b.product_id,
        SUM(b.cost_total_cents)::bigint AS total_cost,
        SUM(b.units_produced) AS total_units
      FROM batches b
      GROUP BY b.product_id
    )
    SELECT p.id AS "productId", p.name AS "productName",
      COALESCE(sold.revenue, 0)::bigint AS "revenueCents",
      CASE WHEN cost.total_units > 0
        THEN (cost.total_cost::numeric / cost.total_units * COALESCE(sold.units_sold, 0))::bigint
        ELSE 0
      END AS "costCents",
      (COALESCE(sold.revenue, 0) - (CASE WHEN cost.total_units > 0
        THEN (cost.total_cost::numeric / cost.total_units * COALESCE(sold.units_sold, 0))::bigint
        ELSE 0 END))::bigint AS "marginCents",
      CASE WHEN COALESCE(sold.revenue, 0) > 0
        THEN ((COALESCE(sold.revenue, 0) - COALESCE((cost.total_cost::numeric / NULLIF(cost.total_units, 0)) * COALESCE(sold.units_sold, 0), 0)) / sold.revenue)::float
        ELSE 0
      END AS "marginPct"
    FROM products p
    LEFT JOIN sold ON sold.product_id = p.id
    LEFT JOIN cost ON cost.product_id = p.id
    ORDER BY "revenueCents" DESC
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      productId: Number(o.productId),
      productName: String(o.productName),
      revenueCents: Number(o.revenueCents),
      costCents: Number(o.costCents),
      marginCents: Number(o.marginCents),
      marginPct: Number(o.marginPct),
    };
  });
}

export type TopProductRow = { productId: number; name: string; units: number; revenueCents: number };

export async function getTopProducts(rangeDays = 30, limit = 10): Promise<TopProductRow[]> {
  const r = await db.execute(sql`
    SELECT p.id AS "productId", p.name,
      SUM(oi.qty * pd.size)::int AS units,
      SUM(oi.line_total_cents)::bigint AS "revenueCents"
    FROM order_items oi
    JOIN pack_definitions pd ON pd.id = oi.pack_definition_id
    JOIN products p ON p.id = pd.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('paid', 'fulfilled')
      AND o.created_at >= NOW() - (${rangeDays} || ' days')::interval
    GROUP BY p.id, p.name
    ORDER BY "revenueCents" DESC
    LIMIT ${limit}
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      productId: Number(o.productId),
      name: String(o.name),
      units: Number(o.units),
      revenueCents: Number(o.revenueCents),
    };
  });
}

export type CriticalRow = { kind: 'product' | 'supply'; id: number; name: string; stock: number; reorderPoint: number; unit?: string };

export async function getCriticalStockProducts(): Promise<CriticalRow[]> {
  const r = await db.execute(sql`
    SELECT 'product' AS kind, p.id, p.name,
      COALESCE((SELECT SUM(delta) FROM stock_movements WHERE product_id = p.id), 0)::int AS stock,
      p.reorder_point AS "reorderPoint",
      NULL::text AS unit
    FROM products p
    WHERE p.active = true
      AND COALESCE((SELECT SUM(delta) FROM stock_movements WHERE product_id = p.id), 0) < p.reorder_point
    UNION ALL
    SELECT 'supply' AS kind, s.id, s.name, s.current_qty AS stock, s.reorder_point AS "reorderPoint", s.unit
    FROM supplies s
    WHERE s.current_qty < s.reorder_point
    ORDER BY (stock::float / NULLIF(reorder_point, 0)) ASC NULLS LAST
  `);
  return r.rows as CriticalRow[];
}

export type SalesByDayRow = { day: string; orders: number; totalCents: number };

export async function getSalesByPeriod(rangeDays = 30): Promise<SalesByDayRow[]> {
  const r = await db.execute(sql`
    SELECT to_char(date_trunc('day', o.created_at), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS orders,
      SUM(o.total_cents)::bigint AS "totalCents"
    FROM orders o
    WHERE o.status IN ('paid', 'fulfilled')
      AND o.created_at >= NOW() - (${rangeDays} || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return { day: String(o.day), orders: Number(o.orders), totalCents: Number(o.totalCents) };
  });
}
