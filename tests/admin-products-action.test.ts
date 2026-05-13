import { describe, it, expect, vi, beforeEach } from 'vitest';

const returningMock = vi.fn();

vi.mock('@/db', () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => ({
          returning: returningMock,
        }),
      }),
    }),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { updateProduct } from '@/app/(admin)/admin/productos/[id]/edit/actions';
import { revalidatePath } from 'next/cache';

function buildFormData(overrides: Record<string, string | boolean> = {}) {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    id: '1',
    name: 'IPA',
    style: 'IPA',
    format: 'lata_473',
    abvDefault: '65',
    ibuDefault: '50',
    description: '',
    heroImageUrl: '',
    reorderPoint: '50',
    active: 'on',
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(k, String(v));
  }
  return fd;
}

describe('updateProduct action', () => {
  beforeEach(() => {
    returningMock.mockReset();
    (revalidatePath as any).mockReset();
  });

  it('returns ok when valid data + revalidates 3 paths (admin/productos, /cervezas, /cervezas/<slug>)', async () => {
    returningMock.mockResolvedValue([{ slug: 'ipa-cumbre' }]);
    const fd = buildFormData();
    const r = await updateProduct({}, fd);
    expect(r.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledTimes(3);
    expect(revalidatePath).toHaveBeenCalledWith('/admin/productos');
    expect(revalidatePath).toHaveBeenCalledWith('/cervezas');
    expect(revalidatePath).toHaveBeenCalledWith('/cervezas/ipa-cumbre');
  });

  it('skips slug revalidate when product no longer exists', async () => {
    returningMock.mockResolvedValue([]);
    const fd = buildFormData();
    const r = await updateProduct({}, fd);
    expect(r.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenCalledWith('/admin/productos');
    expect(revalidatePath).toHaveBeenCalledWith('/cervezas');
  });

  it('returns errors when name is empty', async () => {
    const fd = buildFormData({ name: '' });
    const r = await updateProduct({}, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.path?.includes('name'))).toBe(true);
    }
  });

  it('returns generic error when DB throws', async () => {
    returningMock.mockRejectedValue(new Error('connection lost'));
    const fd = buildFormData();
    const r = await updateProduct({}, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors[0].message).toMatch(/error|database/i);
    }
  });

  it('rejects when id is missing', async () => {
    const fd = buildFormData();
    fd.delete('id');
    const r = await updateProduct({}, fd);
    expect(r.ok).toBe(false);
  });
});
