import { describe, it, expect, beforeAll } from 'vitest';
import { signCart, verifyCart, addLine, updateQty, removeLine, type Cart } from '@/lib/cart';

const empty: Cart = { lines: [] };

describe('cart hmac', () => {
  beforeAll(() => {
    process.env.CART_SECRET = process.env.CART_SECRET ?? 'a'.repeat(32);
  });

  it('sign + verify roundtrip preserves cart', async () => {
    const c: Cart = { lines: [{ packId: 1, qty: 2 }, { packId: 5, qty: 1 }] };
    const token = await signCart(c);
    const back = await verifyCart(token);
    expect(back).toEqual(c);
  });

  it('verifyCart returns null on tampered payload', async () => {
    const token = await signCart({ lines: [{ packId: 1, qty: 2 }] });
    const [h, p, s] = token.split('.');
    const tampered = `${h}.${Buffer.from('{"lines":[{"packId":1,"qty":99}],"exp":9999999999999}').toString('base64url')}.${s}`;
    expect(await verifyCart(tampered)).toBeNull();
  });

  it('verifyCart returns null on expired token', async () => {
    const c: Cart = { lines: [{ packId: 1, qty: 1 }] };
    const token = await signCart(c, /* ttlMsOverride */ -1000);
    expect(await verifyCart(token)).toBeNull();
  });

  it('verifyCart returns null on malformed token', async () => {
    expect(await verifyCart('not.a.token')).toBeNull();
    expect(await verifyCart('')).toBeNull();
    expect(await verifyCart('a.b')).toBeNull();
  });
});

describe('cart mutations', () => {
  it('addLine new pack appends', () => {
    expect(addLine(empty, 7, 2)).toEqual({ lines: [{ packId: 7, qty: 2 }] });
  });

  it('addLine existing pack merges qty', () => {
    const c: Cart = { lines: [{ packId: 7, qty: 2 }] };
    expect(addLine(c, 7, 3)).toEqual({ lines: [{ packId: 7, qty: 5 }] });
  });

  it('updateQty replaces qty, removes if 0', () => {
    const c: Cart = { lines: [{ packId: 7, qty: 5 }, { packId: 9, qty: 1 }] };
    expect(updateQty(c, 7, 2)).toEqual({ lines: [{ packId: 7, qty: 2 }, { packId: 9, qty: 1 }] });
    expect(updateQty(c, 7, 0)).toEqual({ lines: [{ packId: 9, qty: 1 }] });
  });

  it('removeLine drops the matching line', () => {
    const c: Cart = { lines: [{ packId: 7, qty: 5 }, { packId: 9, qty: 1 }] };
    expect(removeLine(c, 7)).toEqual({ lines: [{ packId: 9, qty: 1 }] });
  });

  it('addLine clamps qty to max 99', () => {
    const c: Cart = { lines: [{ packId: 7, qty: 95 }] };
    expect(addLine(c, 7, 10)).toEqual({ lines: [{ packId: 7, qty: 99 }] });
  });
});
