import dotenv from 'dotenv';

// Load env BEFORE any other imports
dotenv.config({ path: '.env.local' });
dotenv.config();

// Import AFTER dotenv is configured
import { eq } from 'drizzle-orm';

async function main() {
  // Import db here to ensure env is loaded first
  const { db } = await import('@/db');
  const { users } = await import('@/db/schema');
  const { hashPassword } = await import('@/lib/auth/hash');

  const email = process.env.INITIAL_OWNER_EMAIL;
  const password = process.env.INITIAL_OWNER_PASSWORD;
  if (!email || !password) {
    console.error('[setup-owner] missing INITIAL_OWNER_EMAIL or INITIAL_OWNER_PASSWORD env vars.');
    process.exit(1);
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log(`[setup-owner] user ${email} already exists (id=${existing.id}). Skipping.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const [inserted] = await db.insert(users).values({
    email,
    passwordHash,
    role: 'owner',
    name: email.split('@')[0],
    active: true,
  }).returning();

  console.log(`[setup-owner] created owner user id=${inserted.id} email=${email}`);
  console.log('[setup-owner] IMPORTANT: delete INITIAL_OWNER_EMAIL and INITIAL_OWNER_PASSWORD env vars now.');
}

main().catch((err) => {
  console.error('[setup-owner] failed:', err);
  process.exit(1);
});
