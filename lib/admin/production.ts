import { sql, eq } from 'drizzle-orm';
import { db } from '@/db';
import { batches, stockMovements, supplyMovements, supplies } from '@/db/schema';

export class ProductionInsufficientSupplyError extends Error {
  supplyId: number;
  required: number;
  available: number;
  constructor(supplyId: number, required: number, available: number) {
    super(`supply ${supplyId} insufficient: required ${required}, available ${available}`);
    this.name = 'ProductionInsufficientSupplyError';
    this.supplyId = supplyId;
    this.required = required;
    this.available = available;
  }
}

export type ProductionInput = {
  productId: number;
  lotCode: string;
  bottledAt: Date;
  abv: number | null;
  ibu: number | null;
  volumeProducedL: number;
  unitsProduced: number;
  costTotalCents: number;
  notes: string | null;
  consumption: { supplyId: number; qty: number }[];
  createdBy: number;
};

export async function produceBatch(input: ProductionInput): Promise<{ batchId: number }> {
  // Validate consumption shape outside TX (cheap checks)
  const ids = new Set<number>();
  for (const c of input.consumption) {
    if (!Number.isFinite(c.qty) || c.qty <= 0) {
      throw new Error(`consumption qty must be > 0 (supplyId=${c.supplyId})`);
    }
    if (ids.has(c.supplyId)) {
      throw new Error(`duplicate supply in consumption: ${c.supplyId}`);
    }
    ids.add(c.supplyId);
  }
  if (input.unitsProduced <= 0) throw new Error('unitsProduced must be > 0');
  if (input.volumeProducedL <= 0) throw new Error('volumeProducedL must be > 0');

  const supplyIds = input.consumption.map((c) => c.supplyId);

  const result = await db.transaction(async (tx) => {
    // Lock supplies FOR UPDATE
    let available = new Map<number, number>();
    if (supplyIds.length > 0) {
      const idsList = sql.raw(`ARRAY[${supplyIds.join(',')}]::int[]`);
      const rows = await tx.execute(
        sql`SELECT id, current_qty FROM supplies WHERE id = ANY(${idsList}) FOR UPDATE`,
      );
      const data = (rows.rows ?? []) as { id: number; current_qty: number }[];
      available = new Map(data.map((r) => [r.id, Number(r.current_qty)]));
    }

    // Validate availability
    for (const c of input.consumption) {
      const have = available.get(c.supplyId) ?? 0;
      if (have < c.qty) {
        throw new ProductionInsufficientSupplyError(c.supplyId, c.qty, have);
      }
    }

    // Insert batch
    const [batchRow] = await tx
      .insert(batches)
      .values({
        productId: input.productId,
        lotCode: input.lotCode,
        bottledAt: input.bottledAt,
        abv: input.abv,
        ibu: input.ibu,
        volumeProducedL: input.volumeProducedL,
        unitsProduced: input.unitsProduced,
        costTotalCents: input.costTotalCents,
        notes: input.notes,
        status: 'bottled',
      })
      .returning({ id: batches.id });

    const batchId = batchRow.id;

    // Insert positive stock_movement for produced units
    await tx.insert(stockMovements).values({
      productId: input.productId,
      batchId,
      delta: input.unitsProduced,
      reason: 'production',
      referenceId: batchId,
      createdBy: input.createdBy,
    });

    // Insert negative supply_movements + decrement supplies.current_qty
    if (input.consumption.length > 0) {
      await tx.insert(supplyMovements).values(
        input.consumption.map((c) => ({
          supplyId: c.supplyId,
          delta: -c.qty,
          reason: 'production_consume' as const,
          referenceId: batchId,
        })),
      );
      for (const c of input.consumption) {
        await tx
          .update(supplies)
          .set({ currentQty: sql`${supplies.currentQty} - ${c.qty}` })
          .where(eq(supplies.id, c.supplyId));
      }
    }

    return { batchId };
  });

  return result;
}
