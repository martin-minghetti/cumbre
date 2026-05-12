import { cookies } from 'next/headers';
import { verifySession, type SessionPayload } from './session';

export { signSession, verifySession } from './session';
export { hashPassword, verifyPassword } from './hash';
export type { SessionPayload } from './session';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get('session')?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  return payload ? { userId: payload.userId, role: payload.role } : null;
}
