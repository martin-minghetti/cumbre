import { describe, it, expect, vi } from 'vitest';
import { signSession, verifySession } from '@/lib/auth/session';

describe('signSession', () => {
  it('returns a string with three parts separated by dots', () => {
    const token = signSession({ userId: 1, role: 'owner' });
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('verifySession', () => {
  it('returns payload for a valid token', () => {
    const token = signSession({ userId: 42, role: 'cashier' });
    const result = verifySession(token);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe(42);
    expect(result?.role).toBe('cashier');
  });

  it('returns null for tampered payload', () => {
    const token = signSession({ userId: 1, role: 'owner' });
    const [header, , sig] = token.split('.');
    const fakePayload = Buffer.from(JSON.stringify({ userId: 999, role: 'owner', exp: Date.now() + 10000 })).toString('base64url');
    expect(verifySession(`${header}.${fakePayload}.${sig}`)).toBeNull();
  });

  it('returns null for expired token', () => {
    vi.useFakeTimers();
    const token = signSession({ userId: 1, role: 'owner' });
    vi.advanceTimersByTime(15 * 24 * 60 * 60 * 1000); // 15 days
    expect(verifySession(token)).toBeNull();
    vi.useRealTimers();
  });

  it('returns null for malformed token', () => {
    expect(verifySession('not-a-token')).toBeNull();
    expect(verifySession('a.b')).toBeNull();
  });
});
