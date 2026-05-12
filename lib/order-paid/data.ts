import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  batches,
  customers,
  orderItems,
  orders,
  packDefinitions,
  products,
  stockMovements,
} from '@/db/schema';

export type LoadedOrder = {
  order: typeof orders.$inferSelect;
  items: (typeof orderItems.$inferSelect & {
    productId: number;
    productName: string;
    packSize: number;
    format: string;
  })[];
  customer: typeof customers.$inferSelect;
};

export async function loadOrderForPaid(orderId: number): Promise<LoadedOrder | null> {
  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) return null;
  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      packDefinitionId: orderItems.packDefinitionId,
      qty: orderItems.qty,
      unitPriceCents: orderItems.unitPriceCents,
      lineTotalCents: orderItems.lineTotalCents,
      productId: packDefinitions.productId,
      productName: products.name,
      packSize: packDefinitions.size,
      format: products.format,
    })
    .from(orderItems)
    .innerJoin(packDefinitions, eq(orderItems.packDefinitionId, packDefinitions.id))
    .innerJoin(products, eq(packDefinitions.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
  const [c] = await db.select().from(customers).where(eq(customers.id, o.customerId)).limit(1);
  if (!c) return null;
  return { order: o, items, customer: c };
}

/**
 * Returns Map<productId, [{batchId, available}]> FIFO-sorted, with batch rows locked.
 * Caller MUST be inside a transaction.
 */
export async function lockBatchesForProductsFifo(
  productIds: number[],
): Promise<Map<number, { batchId: number; available: number }[]>> {
  if (productIds.length === 0) return new Map();
  // Lock the batches FOR UPDATE in product/bottled_at order
  const productIdsList = sql.raw(`ARRAY[${productIds.join(',')}]::int[]`);
  const lockedRows = await db.execute(
    sql`SELECT id, product_id, bottled_at FROM batches WHERE product_id = ANY(${productIdsList}) AND status = 'bottled' ORDER BY product_id, bottled_at ASC FOR UPDATE`,
  );
  const lockedBatches = (lockedRows.rows ?? []) as { id: number; product_id: number; bottled_at: string }[];
  const out = new Map<number, { batchId: number; available: number }[]>();
  for (const p of productIds) out.set(p, []);
  if (lockedBatches.length === 0) return out;

  const batchIds = lockedBatches.map((b) => b.id);
  const avail = await db
    .select({
      batchId: stockMovements.batchId,
      sum: sql<number>`COALESCE(SUM(${stockMovements.delta}),0)::int`,
    })
    .from(stockMovements)
    .where(inArray(stockMovements.batchId, batchIds))
    .groupBy(stockMovements.batchId);
  const availMap = new Map(avail.map((a) => [a.batchId, a.sum]));

  for (const row of lockedBatches) {
    const a = availMap.get(row.id) ?? 0;
    if (a > 0) out.get(row.product_id)!.push({ batchId: row.id, available: a });
  }
  return out;
}

export async function applyMovements(
  movs: { productId: number; batchId: number; delta: number; reason: 'sale_online'; referenceId: number | null }[],
): Promise<void> {
  if (movs.length === 0) return;
  await db.insert(stockMovements).values(movs);
}

/**
 * Atomically transitions order to 'paid' with mp_payment_id set. Returns true if applied,
 * false if it was already paid with the SAME mp_payment_id (idempotent). Throws on conflict
 * with a DIFFERENT mp_payment_id (DB UNIQUE will also enforce this).
 */
export async function markOrderPaid(
  orderId: number,
  mpPaymentId: string,
  paymentStatus: string,
): Promise<boolean> {
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) throw new Error(`order ${orderId} not found`);

  if (existing.mpPaymentId) {
    if (existing.mpPaymentId === mpPaymentId) return false;
    throw new Error(`mp_payment_id conflict: ${existing.mpPaymentId} vs ${mpPaymentId}`);
  }

  await db
    .update(orders)
    .set({ status: 'paid', mpPaymentId, paymentStatus, paidAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.mpPaymentId)));
  return true;
}

export async function markOrderCancelled(orderId: number): Promise<void> {
  await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId));
}

export async function upsertCustomer(args: {
  email: string;
  name: string;
  phone?: string | null;
  address?: object | null;
}): Promise<number> {
  const [existing] = await db.select().from(customers).where(eq(customers.email, args.email)).limit(1);
  if (existing) {
    await db
      .update(customers)
      .set({ name: args.name, phone: args.phone ?? existing.phone, address: args.address ?? existing.address })
      .where(eq(customers.id, existing.id));
    return existing.id;
  }
  const [ins] = await db
    .insert(customers)
    .values({ email: args.email, name: args.name, phone: args.phone ?? null, address: args.address ?? null })
    .returning({ id: customers.id });
  return ins.id;
}
