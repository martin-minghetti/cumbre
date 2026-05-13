import { z } from 'zod';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const ProductUpdateSchema = z.object({
  name: z.string().min(2).max(255),
  style: z.string().min(1).max(64),
  format: z.enum(['lata_473', 'porron_1l']),
  abvDefault: z.number().int().min(0).max(200).nullable(),
  ibuDefault: z.number().int().min(0).max(200).nullable(),
  description: z.string().nullable(),
  heroImageUrl: z
    .union([z.string().url(), z.literal('')])
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  reorderPoint: z.number().int().min(0),
  active: z.boolean(),
});

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  style: string;
  format: 'lata_473' | 'porron_1l';
  abvDefault: number | null;
  ibuDefault: number | null;
  reorderPoint: number;
  active: boolean;
  derivedStock: number;
};

export async function listProductsWithStock(): Promise<ProductRow[]> {
  const r = await db.execute(sql`
    SELECT
      p.id, p.slug, p.name, p.style, p.format,
      p.abv_default AS "abvDefault",
      p.ibu_default AS "ibuDefault",
      p.reorder_point AS "reorderPoint",
      p.active,
      COALESCE(SUM(sm.delta), 0)::int AS "derivedStock"
    FROM products p
    LEFT JOIN stock_movements sm ON sm.product_id = p.id
    GROUP BY p.id
    ORDER BY p.name
  `);
  return r.rows as ProductRow[];
}

export async function getProductById(id: number) {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}
