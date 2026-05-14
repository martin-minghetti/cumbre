import { z } from 'zod';
import { db } from '@/db';
import { supplies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const SupplySchema = z.object({
  name: z.string().min(1).max(255),
  unit: z.string().min(1).max(32),
  reorderPoint: z.number().int().min(0),
  currentQty: z.number().int().min(0),
});

export type SupplyInput = z.infer<typeof SupplySchema>;
export type Supply = typeof supplies.$inferSelect;

export async function listSupplies(): Promise<Supply[]> {
  return db.select().from(supplies).orderBy(supplies.name);
}

export async function getSupplyById(id: number): Promise<Supply | null> {
  const rows = await db.select().from(supplies).where(eq(supplies.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createSupply(input: SupplyInput): Promise<number> {
  const [row] = await db.insert(supplies).values(input).returning({ id: supplies.id });
  return row.id;
}

export async function updateSupply(id: number, input: SupplyInput): Promise<void> {
  await db.update(supplies).set(input).where(eq(supplies.id, id));
}
