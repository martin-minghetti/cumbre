import { z } from 'zod';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const channelFilterSchema = z.enum(['all', 'online', 'pos']);
export type Channel = z.infer<typeof channelFilterSchema>;

export type UnifiedSaleRow = {
  source: 'online' | 'pos';
  id: number;
  createdAt: string;
  status: string | null;
  customerLabel: string;
  paymentMethod: string | null;
  totalCents: number;
};

export type UnifiedFilters = {
  channel: Channel;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

export async function listUnifiedSales(filters: UnifiedFilters): Promise<UnifiedSaleRow[]> {
  const includeOnline = filters.channel === 'all' || filters.channel === 'online';
  const includePos = filters.channel === 'all' || filters.channel === 'pos';

  const parts: ReturnType<typeof sql>[] = [];

  if (includeOnline) {
    const conds: ReturnType<typeof sql>[] = [];
    if (filters.status) conds.push(sql`o.status = ${filters.status}`);
    if (filters.fromDate) conds.push(sql`o.created_at >= ${filters.fromDate}`);
    if (filters.toDate) conds.push(sql`o.created_at < (${filters.toDate}::date + INTERVAL '1 day')`);
    const where = conds.length > 0 ? sql.join([sql`WHERE`, sql.join(conds, sql` AND `)], sql` `) : sql``;
    parts.push(sql`
      SELECT 'online'::text AS source, o.id, o.created_at AS "createdAt",
        o.status::text AS status,
        c.email AS "customerLabel",
        NULL::text AS "paymentMethod",
        o.total_cents AS "totalCents"
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ${where}
    `);
  }

  if (includePos) {
    const conds: ReturnType<typeof sql>[] = [];
    if (filters.fromDate) conds.push(sql`ps.created_at >= ${filters.fromDate}`);
    if (filters.toDate) conds.push(sql`ps.created_at < (${filters.toDate}::date + INTERVAL '1 day')`);
    const where = conds.length > 0 ? sql.join([sql`WHERE`, sql.join(conds, sql` AND `)], sql` `) : sql``;
    parts.push(sql`
      SELECT 'pos'::text AS source, ps.id, ps.created_at AS "createdAt",
        NULL::text AS status,
        CONCAT('POS, ', u.name) AS "customerLabel",
        ps.payment_method::text AS "paymentMethod",
        ps.total_cents AS "totalCents"
      FROM pos_sales ps
      JOIN users u ON u.id = ps.cashier_id
      ${where}
    `);
  }

  if (parts.length === 0) return [];
  const unioned = sql.join(parts, sql` UNION ALL `);

  const r = await db.execute(sql`
    SELECT * FROM (${unioned}) sub
    ORDER BY "createdAt" DESC
    LIMIT 500
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      source: o.source as 'online' | 'pos',
      id: Number(o.id),
      createdAt: String(o.createdAt),
      status: o.status == null ? null : String(o.status),
      customerLabel: String(o.customerLabel),
      paymentMethod: o.paymentMethod == null ? null : String(o.paymentMethod),
      totalCents: Number(o.totalCents),
    };
  });
}

export type PosSaleDetail = {
  sale: { id: number; createdAt: string; cashierName: string; paymentMethod: string; totalCents: number; cashSessionId: number };
  items: { id: number; productName: string; packSize: number; qty: number; unitPriceCents: number; lineTotalCents: number; batchLotCodes: string[] }[];
};

export async function getPosSaleDetail(id: number): Promise<PosSaleDetail | null> {
  const head = await db.execute(sql`
    SELECT ps.id, ps.created_at AS "createdAt", ps.payment_method AS "paymentMethod",
      ps.total_cents AS "totalCents", ps.cash_session_id AS "cashSessionId",
      u.name AS "cashierName"
    FROM pos_sales ps
    JOIN users u ON u.id = ps.cashier_id
    WHERE ps.id = ${id}
  `);
  if (head.rows.length === 0) return null;
  const h = head.rows[0] as Record<string, unknown>;

  const items = await db.execute(sql`
    SELECT psi.id, p.name AS "productName", pd.size AS "packSize", psi.qty,
      psi.unit_price_cents AS "unitPriceCents",
      (psi.qty * psi.unit_price_cents)::bigint AS "lineTotalCents",
      COALESCE(array_agg(b.lot_code) FILTER (WHERE b.lot_code IS NOT NULL), '{}') AS "batchLotCodes"
    FROM pos_sale_items psi
    JOIN pack_definitions pd ON pd.id = psi.pack_definition_id
    JOIN products p ON p.id = pd.product_id
    LEFT JOIN stock_movements sm ON sm.reference_id = psi.pos_sale_id AND sm.product_id = p.id AND sm.reason = 'sale_pos'
    LEFT JOIN batches b ON b.id = sm.batch_id
    WHERE psi.pos_sale_id = ${id}
    GROUP BY psi.id, p.name, pd.size, psi.qty, psi.unit_price_cents
    ORDER BY psi.id
  `);

  return {
    sale: {
      id: Number(h.id),
      createdAt: String(h.createdAt),
      cashierName: String(h.cashierName),
      paymentMethod: String(h.paymentMethod),
      totalCents: Number(h.totalCents),
      cashSessionId: Number(h.cashSessionId),
    },
    items: items.rows.map((r) => {
      const o = r as Record<string, unknown>;
      return {
        id: Number(o.id),
        productName: String(o.productName),
        packSize: Number(o.packSize),
        qty: Number(o.qty),
        unitPriceCents: Number(o.unitPriceCents),
        lineTotalCents: Number(o.lineTotalCents),
        batchLotCodes: o.batchLotCodes as string[],
      };
    }),
  };
}
