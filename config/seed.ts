import { eq } from 'drizzle-orm';
import type { Db } from '@/db';
import { batches, packDefinitions, products, stockMovements, suppliers, supplies } from '@/db/schema';

const PRODUCTS = [
  {
    slug: 'catedral-ipa-lata',
    name: 'Catedral',
    style: 'American IPA',
    format: 'lata_473' as const,
    abvDefault: 62,
    ibuDefault: 62,
    description: 'Cítrica de entrada, amarga de salida, sin perdón. Cuatro lúpulos americanos sobre malta Pilsen y Caramel 60. Levadura US-05.',
    heroImageUrl: '/products/catedral-packshot.jpg',
    reorderPoint: 200,
    packs: [
      { size: 1, priceCents: 380000, sku: 'CAT-IPA-L473-1' },
      { size: 6, priceCents: 2000000, sku: 'CAT-IPA-L473-6' },
    ],
    initialBatch: {
      lotCode: 'IPA-260512-01',
      abv: 62, ibu: 62, volume: 820, units: 1732, costCents: 50000000,
      notes: 'Tercer lote del año. Cascade + Citra dry-hop. Salió tal cual el target.',
    },
  },
  {
    slug: 'tronador-stout-porron',
    name: 'Tronador',
    style: 'Imperial Stout',
    format: 'porron_1l' as const,
    abvDefault: 95,
    ibuDefault: 48,
    description: 'Imperial Stout con maltas tostadas (Chocolate, Black Patent, Roasted Barley). Cuerpo pesado, espuma cremosa marrón, final largo a café tostado y cacao amargo.',
    heroImageUrl: '/products/tronador-packshot.jpg',
    reorderPoint: 80,
    packs: [
      { size: 1, priceCents: 820000, sku: 'TRO-STT-P1L-1' },
      { size: 6, priceCents: 4350000, sku: 'TRO-STT-P1L-6' },
    ],
    initialBatch: {
      lotCode: 'STT-260301-01',
      abv: 95, ibu: 48, volume: 400, units: 380, costCents: 38000000,
      notes: 'Levadura S-04 lenta, 7 semanas. OG 1.092, final 1.022. Cuerpo grande, no apto para tarde de calor.',
    },
  },
  {
    slug: 'lopez-helles-lata',
    name: 'López',
    style: 'Helles Lager',
    format: 'lata_473' as const,
    abvDefault: 48,
    ibuDefault: 22,
    description: 'La rubia fácil que igual lleva 6 semanas de lagering. Maltas Pilsen y Munich, agua de deshielo filtrada. Final limpio, amargor sutil.',
    heroImageUrl: '/products/lopez-packshot.jpg',
    reorderPoint: 250,
    packs: [
      { size: 1, priceCents: 320000, sku: 'LOP-LAG-L473-1' },
      { size: 6, priceCents: 1700000, sku: 'LOP-LAG-L473-6' },
    ],
    initialBatch: {
      lotCode: 'LAG-260420-01',
      abv: 48, ibu: 22, volume: 1040, units: 2199, costCents: 55000000,
      notes: 'Saflager W-34/70, lagering 4°C 6 semanas. Limpia, sin off-flavors.',
    },
  },
  {
    slug: 'frey-pilsner-lata',
    name: 'Frey',
    style: 'Bohemian Pilsner',
    format: 'lata_473' as const,
    abvDefault: 51,
    ibuDefault: 38,
    description: 'Pilsner checa de manual. Lúpulo Saaz en abundancia, malta Pilsen 100%, agua blanda. Amargor noble herbal, color dorado pálido.',
    heroImageUrl: '/products/frey-packshot.jpg',
    reorderPoint: 200,
    packs: [
      { size: 1, priceCents: 340000, sku: 'FRE-PIL-L473-1' },
      { size: 6, priceCents: 1800000, sku: 'FRE-PIL-L473-6' },
    ],
    initialBatch: {
      lotCode: 'PIL-260415-01',
      abv: 51, ibu: 38, volume: 820, units: 1740, costCents: 48000000,
      notes: 'Saaz noble en hervor + whirlpool. Final seco herbal.',
    },
  },
  {
    slug: 'piltri-golden-porron',
    name: 'Piltriquitrón',
    style: 'Golden Ale',
    format: 'porron_1l' as const,
    abvDefault: 55,
    ibuDefault: 28,
    description: 'Golden Ale honesta. Malta Pilsen, lúpulos ingleses, levadura US-05. Dorada, suave, fácil. La que pedís cuando no querés elegir.',
    heroImageUrl: '/products/piltri-packshot.jpg',
    reorderPoint: 100,
    packs: [
      { size: 1, priceCents: 580000, sku: 'PIL-GLD-P1L-1' },
      { size: 6, priceCents: 3100000, sku: 'PIL-GLD-P1L-6' },
    ],
    initialBatch: {
      lotCode: 'GLD-260428-01',
      abv: 55, ibu: 28, volume: 600, units: 580, costCents: 42000000,
      notes: 'East Kent Goldings + Fuggles. US-05 a 19°C. Final balanceado.',
    },
  },
  {
    slug: 'campanario-porter-lata',
    name: 'Campanario',
    style: 'American Porter',
    format: 'lata_473' as const,
    abvDefault: 58,
    ibuDefault: 32,
    description: 'Porter americano con maltas chocolate y crystal 80. Notas de café, cacao y caramelo, cuerpo medio. La hecha pensando en una tarde de lluvia mirando el bosque.',
    heroImageUrl: '/products/campanario-packshot.jpg',
    reorderPoint: 120,
    packs: [
      { size: 1, priceCents: 360000, sku: 'CAM-POR-L473-1' },
      { size: 6, priceCents: 1900000, sku: 'CAM-POR-L473-6' },
    ],
    initialBatch: {
      lotCode: 'POR-260408-01',
      abv: 58, ibu: 32, volume: 740, units: 1565, costCents: 47000000,
      notes: 'Chocolate Malt + Crystal 80 + Roasted Barley sutil. US-05 a 18°C.',
    },
  },
];

const SUPPLIERS = [
  { name: 'Maltería Quilmes', contactName: 'Juan Pérez', email: 'ventas@malteria.com.ar', phone: '+54 11 4321-5000', cuit: '30-50001236-8' },
  { name: 'Centro Andino Lúpulos', contactName: 'María Soto', email: 'pedidos@lupuloscomarca.com', phone: '+54 294 555-1100', cuit: '30-71234567-1' },
  { name: 'Latas Sur SRL', contactName: 'Carlos Méndez', email: 'comercial@latassur.com.ar', phone: '+54 11 5544-1234', cuit: '30-71890123-4' },
];

const SUPPLIES = [
  { name: 'Malta Pilsen', unit: 'kg', reorderPoint: 50 },
  { name: 'Malta Caramel 60', unit: 'kg', reorderPoint: 20 },
  { name: 'Malta Chocolate', unit: 'kg', reorderPoint: 15 },
  { name: 'Malta Roasted Barley', unit: 'kg', reorderPoint: 10 },
  { name: 'Lúpulo Cascade', unit: 'g', reorderPoint: 2000 },
  { name: 'Lúpulo Citra', unit: 'g', reorderPoint: 2000 },
  { name: 'Lúpulo Mosaic', unit: 'g', reorderPoint: 1500 },
  { name: 'Lúpulo Saaz', unit: 'g', reorderPoint: 2000 },
  { name: 'Levadura US-05', unit: 'unidades', reorderPoint: 5 },
  { name: 'Levadura S-04', unit: 'unidades', reorderPoint: 5 },
  { name: 'Levadura W-34/70', unit: 'unidades', reorderPoint: 5 },
  { name: 'Lata 473 ml vacía', unit: 'unidades', reorderPoint: 1000 },
  { name: 'Porrón 1 L vacío', unit: 'unidades', reorderPoint: 300 },
];

export async function seedAll(db: Db) {
  console.log('[seed] starting…');

  // Suppliers
  for (const s of SUPPLIERS) {
    const [existing] = await db.select().from(suppliers).where(eq(suppliers.name, s.name)).limit(1);
    if (existing) continue;
    await db.insert(suppliers).values(s);
  }
  console.log('[seed] suppliers OK');

  // Supplies
  for (const sup of SUPPLIES) {
    const [existing] = await db.select().from(supplies).where(eq(supplies.name, sup.name)).limit(1);
    if (existing) continue;
    await db.insert(supplies).values(sup);
  }
  console.log('[seed] supplies OK');

  // Products + packs + initial batches
  for (const p of PRODUCTS) {
    const [existingProduct] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
    let productId: number;

    if (existingProduct) {
      productId = existingProduct.id;
    } else {
      const [inserted] = await db.insert(products).values({
        slug: p.slug, name: p.name, style: p.style, format: p.format,
        abvDefault: p.abvDefault, ibuDefault: p.ibuDefault,
        description: p.description, heroImageUrl: p.heroImageUrl,
        reorderPoint: p.reorderPoint, active: true,
      }).returning();
      productId = inserted.id;
    }

    for (const pack of p.packs) {
      const [existingPack] = await db.select().from(packDefinitions).where(eq(packDefinitions.sku, pack.sku)).limit(1);
      if (existingPack) continue;
      await db.insert(packDefinitions).values({
        productId, size: pack.size, priceCents: pack.priceCents, sku: pack.sku, active: true,
      });
    }

    const b = p.initialBatch;
    const [existingBatch] = await db.select().from(batches).where(eq(batches.lotCode, b.lotCode)).limit(1);
    if (existingBatch) continue;
    const [insertedBatch] = await db.insert(batches).values({
      productId, lotCode: b.lotCode,
      bottledAt: new Date(),
      abv: b.abv, ibu: b.ibu,
      volumeProducedL: b.volume, unitsProduced: b.units,
      costTotalCents: b.costCents, notes: b.notes, status: 'bottled',
    }).returning({ id: batches.id });

    // Emit positive stock_movement for the seeded batch so available stock = unitsProduced.
    // Without this, FIFO queries return zero stock and checkout pre-check rejects all orders.
    await db.insert(stockMovements).values({
      productId,
      batchId: insertedBatch.id,
      delta: b.units,
      reason: 'production',
      referenceId: insertedBatch.id,
      notes: `seed: initial production batch ${b.lotCode}`,
    });
  }
  console.log('[seed] products + packs + batches OK');

  console.log('[seed] done.');
}
