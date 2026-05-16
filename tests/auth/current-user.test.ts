import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));
vi.mock('@/lib/auth/session', () => ({
  verifySession: vi.fn(),
}));
vi.mock('@/db', () => ({
  db: { select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn() })) })) })) },
}));

import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { db } from '@/db';
import { currentUser } from '@/lib/auth/current-user';

beforeEach(() => vi.clearAllMocks());

describe('currentUser', () => {
  it('returns null when no session cookie', async () => {
    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue({ get: () => undefined });
    const u = await currentUser();
    expect(u).toBeNull();
  });

  it('returns null when session invalid', async () => {
    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue({ get: () => ({ value: 'tok' }) });
    (verifySession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const u = await currentUser();
    expect(u).toBeNull();
  });

  it('returns user when session valid', async () => {
    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue({ get: () => ({ value: 'tok' }) });
    (verifySession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 7, role: 'cashier', exp: 99999 });
    const limitFn = vi.fn().mockResolvedValue([{ id: 7, email: 'c@x', role: 'cashier', name: 'Cajero', active: true }]);
    const whereFn = vi.fn(() => ({ limit: limitFn }));
    const fromFn = vi.fn(() => ({ where: whereFn }));
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromFn });
    const u = await currentUser();
    expect(u).toEqual({ id: 7, email: 'c@x', role: 'cashier', name: 'Cajero', active: true });
  });

  it('returns null when user is inactive', async () => {
    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue({ get: () => ({ value: 'tok' }) });
    (verifySession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 7, role: 'cashier', exp: 99999 });
    const limitFn = vi.fn().mockResolvedValue([{ id: 7, email: 'c@x', role: 'cashier', name: 'Cajero', active: false }]);
    const whereFn = vi.fn(() => ({ limit: limitFn }));
    const fromFn = vi.fn(() => ({ where: whereFn }));
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromFn });
    const u = await currentUser();
    expect(u).toBeNull();
  });
});
