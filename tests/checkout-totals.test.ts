import { describe, it, expect } from 'vitest';
import { computeTotals } from '@/lib/checkout-totals';

const line = (packId: number, qty: number, unit: number) => ({ packId, qty, unitPriceCents: unit });

describe('computeTotals', () => {
  it('subtotal sums line totals', () => {
    const r = computeTotals({
      lines: [line(1, 2, 500_000), line(2, 1, 1_200_000)],
      shippingMethod: 'pickup',
    });
    expect(r.subtotalCents).toBe(2_200_000); // 2*500k + 1*1.2M = 2.2M cents = $22.000
    expect(r.shippingCents).toBe(0);
    expect(r.totalCents).toBe(2_200_000);
  });

  it('delivery adds zone cost', () => {
    const r = computeTotals({
      lines: [line(1, 1, 500_000)],
      shippingMethod: 'delivery_local',
      zoneName: 'Bariloche centro',
    });
    expect(r.subtotalCents).toBe(500_000);
    expect(r.shippingCents).toBe(250_000);
    expect(r.totalCents).toBe(750_000);
  });

  it('unknown zone throws', () => {
    expect(() =>
      computeTotals({
        lines: [line(1, 1, 500_000)],
        shippingMethod: 'delivery_local',
        zoneName: 'Atlántida',
      }),
    ).toThrow();
  });

  it('empty lines yields zero subtotal', () => {
    const r = computeTotals({ lines: [], shippingMethod: 'pickup' });
    expect(r.subtotalCents).toBe(0);
    expect(r.totalCents).toBe(0);
  });
});
