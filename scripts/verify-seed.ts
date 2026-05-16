import dotenv from 'dotenv';

// Load env BEFORE any other imports
dotenv.config({ path: '.env.local' });
dotenv.config();

async function verify() {
  // Import AFTER dotenv is configured
  const { db } = await import('@/db');
  const { products, packDefinitions, batches, supplies, suppliers } = await import('@/db/schema');

  const productCount = await db.select().from(products);
  const packCount = await db.select().from(packDefinitions);
  const batchCount = await db.select().from(batches);
  const supplyCount = await db.select().from(supplies);
  const supplierCount = await db.select().from(suppliers);

  console.log(`products: ${productCount.length}`);
  console.log(`packs: ${packCount.length}`);
  console.log(`batches: ${batchCount.length}`);
  console.log(`supplies: ${supplyCount.length}`);
  console.log(`suppliers: ${supplierCount.length}`);
}

verify().catch((err) => {
  console.error('[verify] failed:', err);
  process.exit(1);
});
