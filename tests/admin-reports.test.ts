import { describe, it, expect, vi, beforeEach } from 'vitest';

const { exec } = vi.hoisted(() => ({ exec: vi.fn() }));
vi.mock('@/db', () => ({ db: { execute: exec } }));

import { getMarginByProduct, getTopProducts, getCriticalStockProducts, getSalesByPeriod } from '@/lib/admin/reports';

describe('reports', () => {
  beforeEach(() => exec.mockReset());

  it('getMarginByProduct returns shape from query', async () => {
    exec.mockResolvedValueOnce({ rows: [{ productId: 1, productName: 'IPA', revenueCents: '500000', costCents: '200000', marginCents: '300000', marginPct: '0.6' }] });
    const r = await getMarginByProduct(30);
    expect(r).toHaveLength(1);
    expect(r[0].productName).toBe('IPA');
  });

  it('getTopProducts respects limit', async () => {
    exec.mockResolvedValueOnce({ rows: [{ productId: 1, name: 'IPA', units: 50, revenueCents: '500000' }] });
    const r = await getTopProducts(30, 10);
    expect(r).toHaveLength(1);
  });

  it('getCriticalStockProducts returns rows', async () => {
    exec.mockResolvedValueOnce({ rows: [{ id: 1, name: 'IPA', stock: 10, reorderPoint: 50 }] });
    const r = await getCriticalStockProducts();
    expect(r[0].stock).toBe(10);
  });

  it('getSalesByPeriod groups by day', async () => {
    exec.mockResolvedValueOnce({ rows: [{ day: '2026-05-12', orders: 3, totalCents: '450000' }] });
    const r = await getSalesByPeriod(30);
    expect(r).toHaveLength(1);
  });
});
