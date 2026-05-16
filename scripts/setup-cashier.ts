import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

import { eq } from 'drizzle-orm';

async function main() {
  const { db } = await import('@/db');
  const { users } = await import('@/db/schema');
  const { hashPassword } = await import('@/lib/auth/hash');

  const email = process.env.INITIAL_CASHIER_EMAIL;
  const password = process.env.INITIAL_CASHIER_PASSWORD;
  const name = process.env.INITIAL_CASHIER_NAME ?? 'Cajero Demo';
  if (!email || !password) {
    console.error('[setup-cashier] missing INITIAL_CASHIER_EMAIL or INITIAL_CASHIER_PASSWORD env vars.');
    process.exit(1);
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log(`[setup-cashier] user ${email} already exists (id=${existing.id}). Skipping.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const [inserted] = await db.insert(users).values({
    email,
    passwordHash,
    role: 'cashier',
    name,
    active: true,
  }).returning();

  console.log(`[setup-cashier] created cashier user id=${inserted.id} email=${email}`);
  console.log('[setup-cashier] IMPORTANT: delete INITIAL_CASHIER_EMAIL and INITIAL_CASHIER_PASSWORD env vars now.');
}

main().catch((err) => {
  console.error('[setup-cashier] failed:', err);
  process.exit(1);
});
