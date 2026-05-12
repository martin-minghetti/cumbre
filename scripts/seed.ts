import dotenv from 'dotenv';

// Load env BEFORE any other imports
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  // Import AFTER dotenv is configured
  const { db } = await import('@/db');
  const { seedAll } = await import('@/config/seed');

  console.log('[seed] starting…');
  await seedAll(db);
  console.log('[seed] done.');
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
