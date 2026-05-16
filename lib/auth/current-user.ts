import 'server-only';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifySession } from '@/lib/auth/session';

export type CurrentUser = {
  id: number;
  email: string;
  role: 'owner' | 'cashier';
  name: string;
  active: boolean;
};

export async function currentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const tok = jar.get('session')?.value;
  if (!tok) return null;
  const sess = await verifySession(tok);
  if (!sess) return null;
  const [u] = await db.select().from(users).where(eq(users.id, sess.userId)).limit(1);
  if (!u || !u.active) return null;
  return { id: u.id, email: u.email, role: u.role, name: u.name, active: u.active };
}
