import { z } from 'zod';
import { db } from '@/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const emptyToNull = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().nullable(),
);

const emailEmptyToNull = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().email().nullable(),
);

export const SupplierSchema = z.object({
  name: z.string().min(2).max(255),
  contactName: emptyToNull,
  email: emailEmptyToNull,
  phone: emptyToNull,
  address: emptyToNull,
  cuit: emptyToNull,
  notes: emptyToNull,
});

export type SupplierInput = z.infer<typeof SupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export async function listSuppliers(): Promise<Supplier[]> {
  return db.select().from(suppliers).orderBy(suppliers.name);
}

export async function getSupplierById(id: number): Promise<Supplier | null> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createSupplier(input: SupplierInput): Promise<number> {
  const [row] = await db.insert(suppliers).values(input).returning({ id: suppliers.id });
  return row.id;
}

export async function updateSupplier(id: number, input: SupplierInput): Promise<void> {
  await db.update(suppliers).set(input).where(eq(suppliers.id, id));
}
