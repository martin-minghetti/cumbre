import { describe, it, expect } from 'vitest';
import { calcExpectedAmountCents, openingAmountSchema, closingAmountSchema } from '@/lib/admin/cash-sessions';

describe('cash sessions', () => {
  describe('openingAmountSchema', () => {
    it('accepts zero', () => {
      expect(openingAmountSchema.safeParse({ openingAmountCents: 0 }).success).toBe(true);
    });
    it('rejects negative', () => {
      expect(openingAmountSchema.safeParse({ openingAmountCents: -1 }).success).toBe(false);
    });
    it('rejects non-integer', () => {
      expect(openingAmountSchema.safeParse({ openingAmountCents: 12.5 }).success).toBe(false);
    });
  });

  describe('closingAmountSchema', () => {
    it('accepts zero counted + empty notes', () => {
      const r = closingAmountSchema.safeParse({ closingAmountCountedCents: 0, notes: '' });
      expect(r.success).toBe(true);
    });
    it('caps notes at 500 chars', () => {
      const long = 'x'.repeat(501);
      expect(closingAmountSchema.safeParse({ closingAmountCountedCents: 1000, notes: long }).success).toBe(false);
    });
  });

  describe('calcExpectedAmountCents', () => {
    it('returns opening when no cash sales', () => {
      expect(calcExpectedAmountCents(50_000, [])).toBe(50_000);
    });
    it('sums only payment_method=cash', () => {
      const r = calcExpectedAmountCents(20_000, [
        { totalCents: 5_000, paymentMethod: 'cash' },
        { totalCents: 12_000, paymentMethod: 'card' },
        { totalCents: 8_000, paymentMethod: 'cash' },
        { totalCents: 4_000, paymentMethod: 'transfer' },
      ]);
      expect(r).toBe(33_000);
    });
    it('handles zero opening', () => {
      expect(calcExpectedAmountCents(0, [{ totalCents: 1_000, paymentMethod: 'cash' }])).toBe(1_000);
    });
  });
});
