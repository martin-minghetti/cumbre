import { z } from 'zod';
import { db } from '@/db';
import { products, packDefinitions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';

export const ProductUpdateSchema = z.object({
  name: z.string().min(2).max(255),
  style: z.string().min(1).max(64),
  format: z.enum(['lata_473', 'porron_1l']),
  abvDefault: z.number().int().min(0).max(200).nullable(),
  ibuDefault: z.number().int().min(0).max(200).nullable(),
  description: z.string().nullable(),
  heroImageUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\/[^\s]*$/, 'Must be a URL or a path starting with /'),
      z.literal(''),
    ])
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

export const ProductCreateSchema = z.object({
  name: z.string().min(2).max(255),
  style: z.string().min(1).max(64),
  format: z.enum(['lata_473', 'porron_1l']),
  abvDefault: z.number().int().min(0).max(200).nullable(),
  ibuDefault: z.number().int().min(0).max(200).nullable(),
  description: z.string().nullable(),
  reorderPoint: z.number().int().min(0),
  defaultPriceCents: z.number().int().min(1),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;

export async function createProduct(input: ProductCreateInput): Promise<{ productId: number; slug: string }> {
  const baseSlug = slugify(`${input.name} ${input.style} ${input.format === 'lata_473' ? 'lata' : 'porron'}`);
  if (!baseSlug) throw new Error('Could not generate slug from name');

  return db.transaction(async (tx) => {
    let slug = baseSlug;
    let attempt = 0;
    while (attempt < 20) {
      const existing = await tx.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
      if (existing.length === 0) break;
      attempt++;
      slug = `${baseSlug}-${attempt + 1}`;
    }
    if (attempt >= 20) throw new Error('Could not generate unique slug');

    const [row] = await tx
      .insert(products)
      .values({
        slug,
        name: input.name,
        style: input.style,
        format: input.format,
        abvDefault: input.abvDefault,
        ibuDefault: input.ibuDefault,
        description: input.description,
        heroImageUrl: null,
        reorderPoint: input.reorderPoint,
        active: true,
      })
      .returning({ id: products.id });

    const productId = row.id;
    const sku = slug.toUpperCase().slice(0, 60) + '-1';
    await tx.insert(packDefinitions).values({
      productId,
      size: 1,
      priceCents: input.defaultPriceCents,
      sku,
      active: true,
    });

    return { productId, slug };
  });
}

export async function softDeleteProduct(id: number): Promise<void> {
  await db.update(products).set({ active: false }).where(eq(products.id, id));
}
