import { z } from 'zod';
import { sql, eq } from 'drizzle-orm';
import { db } from '@/db';
import { purchaseOrders, purchaseOrderItems, supplyMovements, supplies } from '@/db/schema';

export type POStatus = 'draft' | 'placed' | 'received' | 'paid' | 'cancelled';

export const POItemSchema = z.object({
  supplyId: z.number().int().positive(),
  qty: z.number().int().positive(),
  unitCostCents: z.number().int().min(0),
});

export const POSchema = z.object({
  supplierId: z.number().int().positive(),
  items: z.array(POItemSchema).min(1),
});

export type POInput = z.infer<typeof POSchema>;
export type POItemInput = z.infer<typeof POItemSchema>;

const ALLOWED: Record<POStatus, POStatus[]> = {
  draft: ['placed', 'cancelled'],
  placed: ['received', 'cancelled'],
  received: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

export function isValidTransition(from: POStatus, to: POStatus): boolean {
  return ALLOWED[from].includes(to);
}

export type POListRow = {
  id: number;
  supplierId: number;
  supplierName: string;
  status: POStatus;
  totalCents: number;
  placedAt: string | null;
  receivedAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

export async function listPurchaseOrders(): Promise<POListRow[]> {
  const r = await db.execute(sql`
    SELECT po.id, po.supplier_id AS "supplierId", s.name AS "supplierName",
      po.status, po.total_cents AS "totalCents",
      po.placed_at AS "placedAt", po.received_at AS "receivedAt", po.paid_at AS "paidAt",
      po.created_at AS "createdAt"
    FROM purchase_orders po
    JOIN suppliers s ON s.id = po.supplier_id
    ORDER BY po.created_at DESC
  `);
  return r.rows as POListRow[];
}

export type POWithItems = {
  po: typeof purchaseOrders.$inferSelect & { supplierName: string };
  items: { id: number; supplyId: number; supplyName: string; unit: string; qty: number; unitCostCents: number }[];
};

export async function getPurchaseOrderWithItems(id: number): Promise<POWithItems | null> {
  const head = await db.execute(sql`
    SELECT po.*, s.name AS "supplierName"
    FROM purchase_orders po
    JOIN suppliers s ON s.id = po.supplier_id
    WHERE po.id = ${id}
  `);
  if (head.rows.length === 0) return null;
  const items = await db.execute(sql`
    SELECT poi.id, poi.supply_id AS "supplyId", su.name AS "supplyName", su.unit,
      poi.qty, poi.unit_cost_cents AS "unitCostCents"
    FROM purchase_order_items poi
    JOIN supplies su ON su.id = poi.supply_id
    WHERE poi.po_id = ${id}
    ORDER BY su.name
  `);
  return {
    po: head.rows[0] as POWithItems['po'],
    items: items.rows as POWithItems['items'],
  };
}

export async function createPurchaseOrder(input: POInput): Promise<{ poId: number }> {
  const totalCents = input.items.reduce((s, it) => s + it.qty * it.unitCostCents, 0);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(purchaseOrders)
      .values({ supplierId: input.supplierId, status: 'draft', totalCents })
      .returning({ id: purchaseOrders.id });
    const poId = row.id;
    await tx.insert(purchaseOrderItems).values(input.items.map((it) => ({ poId, ...it })));
    return { poId };
  });
}

export class InvalidTransitionError extends Error {
  constructor(from: POStatus, to: POStatus) {
    super(`invalid transition: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export async function transitionPurchaseOrder(
  poId: number,
  to: POStatus,
): Promise<void> {
  await db.transaction(async (tx) => {
    const head = await tx.execute(sql`SELECT id, status FROM purchase_orders WHERE id = ${poId} FOR UPDATE`);
    if (head.rows.length === 0) throw new Error(`purchase order ${poId} not found`);
    const current = (head.rows[0] as { status: POStatus }).status;
    if (!isValidTransition(current, to)) throw new InvalidTransitionError(current, to);

    const now = new Date();
    const fields: Record<string, unknown> = { status: to };
    if (to === 'placed') fields.placedAt = now;
    if (to === 'received') fields.receivedAt = now;
    if (to === 'paid') fields.paidAt = now;

    await tx.update(purchaseOrders).set(fields).where(eq(purchaseOrders.id, poId));

    // On received: emit supply_movements + bump supplies.current_qty
    if (to === 'received') {
      const items = await tx.execute(sql`SELECT supply_id, qty FROM purchase_order_items WHERE po_id = ${poId}`);
      const itemRows = items.rows as { supply_id: number; qty: number }[];
      if (itemRows.length > 0) {
        await tx.insert(supplyMovements).values(
          itemRows.map((it) => ({
            supplyId: it.supply_id,
            delta: Number(it.qty),
            reason: 'purchase_receive' as const,
            referenceId: poId,
          })),
        );
        for (const it of itemRows) {
          await tx
            .update(supplies)
            .set({ currentQty: sql`${supplies.currentQty} + ${Number(it.qty)}` })
            .where(eq(supplies.id, it.supply_id));
        }
      }
    }
  });
}
