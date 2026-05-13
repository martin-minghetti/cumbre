import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    execute: vi.fn(),
  },
}));

import {
  getMonthlyRevenueCents,
  getCriticalStockCount,
  getActiveBatchCount,
} from '@/lib/admin/dashboard';
import { db } from '@/db';

describe('getMonthlyRevenueCents', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 0 when no paid orders this month', async () => {
    (db.execute as any).mockResolvedValue({ rows: [{ total: null }] });
    const r = await getMonthlyRevenueCents();
    expect(r).toBe(0);
  });

  it('returns sum of paid orders total this month', async () => {
    (db.execute as any).mockResolvedValue({ rows: [{ total: '125000' }] });
    const r = await getMonthlyRevenueCents();
    expect(r).toBe(125000);
  });
});

describe('getCriticalStockCount', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns count of products below their reorder_point', async () => {
    (db.execute as any).mockResolvedValue({ rows: [{ count: '3' }] });
    const r = await getCriticalStockCount();
    expect(r).toBe(3);
  });
});

describe('getActiveBatchCount', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns count of batches with remaining > 0', async () => {
    (db.execute as any).mockResolvedValue({ rows: [{ count: '4' }] });
    const r = await getActiveBatchCount();
    expect(r).toBe(4);
  });
});
