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
  const token = jar.get('session')?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || !user.active) return null;
  return { id: user.id, email: user.email, role: user.role, name: user.name, active: user.active };
}
