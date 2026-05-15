import { db } from '@/db';
import { sql } from 'drizzle-orm';

export type OrderFilters = {
  status?: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  fromDate?: string;
  toDate?: string;
};

export type OrderListRow = {
  id: number;
  createdAt: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  customerEmail: string;
  customerName: string;
  shippingMethod: 'delivery_local' | 'pickup';
  subtotalCents: number;
  shippingCostCents: number;
  totalCents: number;
};

export async function listOnlineOrders(filters: OrderFilters = {}): Promise<OrderListRow[]> {
  const conds: ReturnType<typeof sql>[] = [];
  if (filters.status) conds.push(sql`o.status = ${filters.status}`);
  if (filters.fromDate) conds.push(sql`o.created_at >= ${filters.fromDate}`);
  if (filters.toDate) conds.push(sql`o.created_at < (${filters.toDate}::date + INTERVAL '1 day')`);

  const where = conds.length > 0
    ? sql.join([sql`WHERE`, sql.join(conds, sql` AND `)], sql` `)
    : sql``;

  const r = await db.execute(sql`
    SELECT o.id, o.created_at AS "createdAt", o.status,
      c.email AS "customerEmail", c.name AS "customerName",
      o.shipping_method AS "shippingMethod",
      o.subtotal_cents AS "subtotalCents",
      o.shipping_cost_cents AS "shippingCostCents",
      o.total_cents AS "totalCents"
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT 500
  `);
  return r.rows as OrderListRow[];
}

export type OrderCSVRow = {
  id: number;
  createdAt: string;
  status: string;
  customerEmail: string;
  shippingMethod: string;
  subtotalCents: number;
  shippingCostCents: number;
  totalCents: number;
};

function csvField(v: string | number): string {
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ordersToCSV(rows: OrderCSVRow[]): string {
  const header = 'id,fecha,estado,email,envio,subtotal_ars,envio_ars,total_ars';
  const lines = rows.map((r) =>
    [
      r.id,
      r.createdAt,
      r.status,
      r.customerEmail,
      r.shippingMethod,
      (r.subtotalCents / 100).toFixed(2),
      (r.shippingCostCents / 100).toFixed(2),
      (r.totalCents / 100).toFixed(2),
    ].map(csvField).join(','),
  );
  return [header, ...lines].join('\n') + '\n';
}

export type OrderDetail = {
  order: OrderListRow & { paidAt: string | null; fulfilledAt: string | null; mpPaymentId: string | null };
  items: { id: number; productName: string; packSize: number; qty: number; unitPriceCents: number; lineTotalCents: number; batchLotCodes: string[] }[];
  customer: { email: string; name: string; phone: string | null };
};

export async function getOrderDetail(orderId: number): Promise<OrderDetail | null> {
  const head = await db.execute(sql`
    SELECT o.id, o.created_at AS "createdAt", o.status, o.paid_at AS "paidAt", o.fulfilled_at AS "fulfilledAt",
      o.mp_payment_id AS "mpPaymentId", o.shipping_method AS "shippingMethod",
      o.subtotal_cents AS "subtotalCents", o.shipping_cost_cents AS "shippingCostCents", o.total_cents AS "totalCents",
      c.email AS "customerEmail", c.name AS "customerName", c.phone AS "customerPhone"
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ${orderId}
  `);
  if (head.rows.length === 0) return null;
  const h = head.rows[0] as Record<string, unknown>;

  // Lot codes are aggregated at the (order, product) level via stock_movements.reference_id.
  // If an order has multiple order_items for the same product (e.g., unit + pack of same beer),
  // each row will show the union of all lots consumed by that product on the order.
  // Acceptable for the demo scope — proper per-item lot association would require schema change.
  const items = await db.execute(sql`
    SELECT oi.id, p.name AS "productName", pd.size AS "packSize", oi.qty,
      oi.unit_price_cents AS "unitPriceCents", oi.line_total_cents AS "lineTotalCents",
      COALESCE(array_agg(b.lot_code) FILTER (WHERE b.lot_code IS NOT NULL), '{}') AS "batchLotCodes"
    FROM order_items oi
    JOIN pack_definitions pd ON pd.id = oi.pack_definition_id
    JOIN products p ON p.id = pd.product_id
    LEFT JOIN stock_movements sm ON sm.reference_id = oi.order_id AND sm.product_id = p.id AND sm.reason = 'sale_online'
    LEFT JOIN batches b ON b.id = sm.batch_id
    WHERE oi.order_id = ${orderId}
    GROUP BY oi.id, p.name, pd.size
    ORDER BY oi.id
  `);

  return {
    order: {
      id: Number(h.id), createdAt: String(h.createdAt), status: h.status as OrderListRow['status'],
      customerEmail: String(h.customerEmail), customerName: String(h.customerName),
      shippingMethod: h.shippingMethod as OrderListRow['shippingMethod'],
      subtotalCents: Number(h.subtotalCents), shippingCostCents: Number(h.shippingCostCents),
      totalCents: Number(h.totalCents),
      paidAt: h.paidAt as string | null, fulfilledAt: h.fulfilledAt as string | null,
      mpPaymentId: h.mpPaymentId as string | null,
    },
    items: items.rows as OrderDetail['items'],
    customer: { email: String(h.customerEmail), name: String(h.customerName), phone: h.customerPhone as string | null },
  };
}
