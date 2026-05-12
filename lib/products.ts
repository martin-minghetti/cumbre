import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { batches, packDefinitions, products } from '@/db/schema';

export type ProductFormat = 'lata_473' | 'porron_1l';

export type ProductWithExtras = {
  id: number;
  slug: string;
  name: string;
  style: string;
  format: ProductFormat;
  abv: number; // stored × 10 (e.g. 62 means 6.2%)
  ibu: number;
  description: string | null;
  heroImageUrl: string | null;
  active: boolean;
  packs: { id: number; size: number; priceCents: number; sku: string }[];
  currentBatch: {
    lotCode: string;
    bottledAt: Date;
    volumeProducedL: number;
    unitsProduced: number;
    notes: string | null;
  } | null;
};

export async function getAllActiveProducts(): Promise<ProductWithExtras[]> {
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(products.id);
  return Promise.all(rows.map((p) => enrich(p)));
}

export async function getProductBySlug(slug: string): Promise<ProductWithExtras | null> {
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!p || !p.active) return null;
  return enrich(p);
}

async function enrich(p: typeof products.$inferSelect): Promise<ProductWithExtras> {
  const packs = await db
    .select({
      id: packDefinitions.id,
      size: packDefinitions.size,
      priceCents: packDefinitions.priceCents,
      sku: packDefinitions.sku,
    })
    .from(packDefinitions)
    .where(and(eq(packDefinitions.productId, p.id), eq(packDefinitions.active, true)))
    .orderBy(packDefinitions.size);

  const [latestBatch] = await db
    .select()
    .from(batches)
    .where(and(eq(batches.productId, p.id), eq(batches.status, 'bottled')))
    .orderBy(desc(batches.bottledAt))
    .limit(1);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    style: p.style,
    format: p.format,
    abv: p.abvDefault ?? 0,
    ibu: p.ibuDefault ?? 0,
    description: p.description,
    heroImageUrl: p.heroImageUrl,
    active: p.active,
    packs,
    currentBatch: latestBatch
      ? {
          lotCode: latestBatch.lotCode,
          bottledAt: latestBatch.bottledAt,
          volumeProducedL: latestBatch.volumeProducedL,
          unitsProduced: latestBatch.unitsProduced,
          notes: latestBatch.notes,
        }
      : null,
  };
}

export function fmtAbv(abvX10: number): string {
  return `${(abvX10 / 10).toFixed(1)}%`;
}

export function fmtPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export function fmtFormat(format: ProductFormat): string {
  return format === 'lata_473' ? 'lata 473 ml' : 'porrón 1 L';
}
