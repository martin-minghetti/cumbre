import { describe, it, expect } from 'vitest';
import { isValidTransition, POItemSchema, POSchema } from '@/lib/admin/purchase-orders';

describe('isValidTransition', () => {
  it('allows draft -> placed', () => { expect(isValidTransition('draft', 'placed')).toBe(true); });
  it('allows placed -> received', () => { expect(isValidTransition('placed', 'received')).toBe(true); });
  it('allows received -> paid', () => { expect(isValidTransition('received', 'paid')).toBe(true); });
  it('allows any -> cancelled (except paid)', () => {
    expect(isValidTransition('draft', 'cancelled')).toBe(true);
    expect(isValidTransition('placed', 'cancelled')).toBe(true);
    expect(isValidTransition('received', 'cancelled')).toBe(true);
    expect(isValidTransition('paid', 'cancelled')).toBe(false);
  });
  it('rejects backwards transitions', () => {
    expect(isValidTransition('placed', 'draft')).toBe(false);
    expect(isValidTransition('received', 'placed')).toBe(false);
    expect(isValidTransition('paid', 'received')).toBe(false);
  });
  it('rejects same-state', () => { expect(isValidTransition('draft', 'draft')).toBe(false); });
});

describe('POSchema / POItemSchema', () => {
  it('PO requires supplierId', () => {
    expect(POSchema.safeParse({ supplierId: 1, items: [{ supplyId: 1, qty: 10, unitCostCents: 1000 }] }).success).toBe(true);
    expect(POSchema.safeParse({ items: [{ supplyId: 1, qty: 10, unitCostCents: 1000 }] }).success).toBe(false);
  });
  it('PO requires at least 1 item', () => {
    expect(POSchema.safeParse({ supplierId: 1, items: [] }).success).toBe(false);
  });
  it('POItem rejects qty <= 0', () => {
    expect(POItemSchema.safeParse({ supplyId: 1, qty: 0, unitCostCents: 100 }).success).toBe(false);
    expect(POItemSchema.safeParse({ supplyId: 1, qty: -5, unitCostCents: 100 }).success).toBe(false);
  });
  it('POItem rejects unitCostCents < 0', () => {
    expect(POItemSchema.safeParse({ supplyId: 1, qty: 1, unitCostCents: -1 }).success).toBe(false);
  });
});
