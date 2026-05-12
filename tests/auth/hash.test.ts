import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/hash';

describe('hashPassword', () => {
  it('returns a bcrypt hash starting with $2', async () => {
    const hash = await hashPassword('hunter2');
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('produces different hashes for same input (salt)', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
  });
});

describe('verifyPassword', () => {
  it('returns true for matching password', async () => {
    const hash = await hashPassword('correct-horse');
    expect(await verifyPassword('correct-horse', hash)).toBe(true);
  });

  it('returns false for non-matching password', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
