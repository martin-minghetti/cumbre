import { describe, it, expect } from 'vitest';
import { ordersToCSV, type OrderCSVRow } from '@/lib/admin/sales';

describe('ordersToCSV', () => {
  it('emits header row + 1 data row', () => {
    const rows: OrderCSVRow[] = [
      { id: 1, createdAt: '2026-05-12T10:00:00Z', status: 'paid', customerEmail: 'a@b.com', shippingMethod: 'pickup', subtotalCents: 100000, shippingCostCents: 0, totalCents: 100000 },
    ];
    const csv = ordersToCSV(rows);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('id');
    expect(lines[0]).toContain('total_ars');
    expect(lines[1]).toContain('1');
    expect(lines[1]).toContain('1000.00');
  });

  it('escapes commas in fields', () => {
    const rows: OrderCSVRow[] = [
      { id: 2, createdAt: '2026-05-12T10:00:00Z', status: 'paid', customerEmail: 'a,b@x.com', shippingMethod: 'delivery_local', subtotalCents: 200000, shippingCostCents: 25000, totalCents: 225000 },
    ];
    const csv = ordersToCSV(rows);
    expect(csv).toMatch(/"a,b@x\.com"/);
  });

  it('escapes quotes in fields', () => {
    const rows: OrderCSVRow[] = [
      { id: 3, createdAt: '2026-05-12T10:00:00Z', status: 'paid', customerEmail: 'a"b@x.com', shippingMethod: 'pickup', subtotalCents: 100, shippingCostCents: 0, totalCents: 100 },
    ];
    const csv = ordersToCSV(rows);
    expect(csv).toMatch(/"a""b@x\.com"/);
  });

  it('returns just header on empty input', () => {
    const csv = ordersToCSV([]);
    expect(csv.trim().split('\n')).toHaveLength(1);
  });
});
