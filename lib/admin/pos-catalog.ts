import { db } from '@/db';
import { sql } from 'drizzle-orm';

export type PosCatalogRow = {
  productId: number;
  productSlug: string;
  productName: string;
  style: string;
  format: 'lata_473' | 'porron_1l';
  heroImageUrl: string | null;
  stock: number;
  packs: { packDefinitionId: number; size: number; priceCents: number; sku: string }[];
};

export async function getPosCatalog(): Promise<PosCatalogRow[]> {
  const r = await db.execute(sql`
    SELECT
      p.id AS "productId",
      p.slug AS "productSlug",
      p.name AS "productName",
      p.style,
      p.format,
      p.hero_image_url AS "heroImageUrl",
      COALESCE((SELECT SUM(delta) FROM stock_movements WHERE product_id = p.id), 0)::int AS stock,
      COALESCE(json_agg(
        json_build_object(
          'packDefinitionId', pd.id,
          'size', pd.size,
          'priceCents', pd.price_cents,
          'sku', pd.sku
        ) ORDER BY pd.size
      ) FILTER (WHERE pd.id IS NOT NULL), '[]'::json) AS packs
    FROM products p
    LEFT JOIN pack_definitions pd ON pd.product_id = p.id AND pd.active = true
    WHERE p.active = true
    GROUP BY p.id
    ORDER BY p.name
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      productId: Number(o.productId),
      productSlug: String(o.productSlug),
      productName: String(o.productName),
      style: String(o.style),
      format: o.format as 'lata_473' | 'porron_1l',
      heroImageUrl: o.heroImageUrl == null ? null : String(o.heroImageUrl),
      stock: Number(o.stock),
      packs: (o.packs as PosCatalogRow['packs']).map((p) => ({
        packDefinitionId: Number(p.packDefinitionId),
        size: Number(p.size),
        priceCents: Number(p.priceCents),
        sku: String(p.sku),
      })),
    };
  });
}
