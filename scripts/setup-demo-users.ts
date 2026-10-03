import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const { db } = await import('@/db');
  const { users } = await import('@/db/schema');
  const { hashPassword } = await import('@/lib/auth/hash');
  const { DEMO_USERS } = await import('@/config/demo-users');

  for (const u of DEMO_USERS) {
    const passwordHash = await hashPassword(u.password);
    const [row] = await db
      .insert(users)
      .values({ email: u.email, passwordHash, role: u.role, name: u.name, active: true })
      .onConflictDoUpdate({ target: users.email, set: { passwordHash, role: u.role, active: true } })
      .returning();
    console.log(`[setup-demo-users] ${u.role} ${u.email} id=${row.id}`);
  }
}

main().catch((err) => {
  console.error('[setup-demo-users] failed:', err);
  process.exit(1);
});
