import { describe, it, expect, beforeAll } from 'vitest';
import { signOrderToken, verifyOrderToken } from '@/lib/order-token';

describe('order-token', () => {
  beforeAll(() => {
    process.env.ORDER_TOKEN_SECRET = process.env.ORDER_TOKEN_SECRET ?? 'b'.repeat(32);
  });

  it('sign + verify happy path', async () => {
    const t = await signOrderToken(42);
    expect(await verifyOrderToken(t)).toBe(42);
  });

  it('returns null on tampered orderId', async () => {
    const t = await signOrderToken(42);
    const [h, p, s] = t.split('.');
    const fake = Buffer.from(JSON.stringify({ orderId: 999, exp: Date.now() + 3600_000 })).toString('base64url');
    expect(await verifyOrderToken(`${h}.${fake}.${s}`)).toBeNull();
  });

  it('returns null on expired token', async () => {
    const t = await signOrderToken(42, -1000);
    expect(await verifyOrderToken(t)).toBeNull();
  });

  it('returns null on malformed', async () => {
    expect(await verifyOrderToken('not.a.token')).toBeNull();
    expect(await verifyOrderToken('')).toBeNull();
  });
});
