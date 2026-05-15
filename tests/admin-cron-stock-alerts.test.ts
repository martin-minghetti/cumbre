import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/admin/reports', () => ({
  getCriticalStockProducts: vi.fn(),
}));
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  escapeHtml: (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'),
}));
vi.mock('@/lib/env', () => ({
  env: { CRON_SECRET: 'test-secret-12345678', OWNER_EMAIL: 'owner@cumbre.beer' },
}));

import { GET } from '@/app/api/cron/stock-alerts/route';
import { getCriticalStockProducts } from '@/lib/admin/reports';
import { sendEmail } from '@/lib/email';

describe('cron stock-alerts', () => {
  beforeEach(() => {
    (getCriticalStockProducts as any).mockReset();
    (sendEmail as any).mockReset();
  });

  it('returns 401 without correct auth header', async () => {
    const r = await GET(new Request('http://test/api/cron/stock-alerts'));
    expect(r.status).toBe(401);
  });

  it('returns 200 and skips email when no critical items', async () => {
    (getCriticalStockProducts as any).mockResolvedValue([]);
    const r = await GET(new Request('http://test/api/cron/stock-alerts', {
      headers: { Authorization: 'Bearer test-secret-12345678' },
    }));
    expect(r.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('sends email when critical items present', async () => {
    (getCriticalStockProducts as any).mockResolvedValue([
      { kind: 'product', id: 1, name: 'IPA', stock: 10, reorderPoint: 50 },
    ]);
    const r = await GET(new Request('http://test/api/cron/stock-alerts', {
      headers: { Authorization: 'Bearer test-secret-12345678' },
    }));
    expect(r.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
