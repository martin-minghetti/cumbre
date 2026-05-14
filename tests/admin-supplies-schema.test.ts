import { describe, it, expect } from 'vitest';
import { SupplySchema } from '@/lib/admin/supplies';

describe('SupplySchema', () => {
  const valid = { name: 'Malta Pilsen', unit: 'kg', reorderPoint: 50, currentQty: 120 };
  it('accepts valid input', () => {
    expect(SupplySchema.safeParse(valid).success).toBe(true);
  });
  it('rejects empty name', () => {
    expect(SupplySchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });
  it('rejects negative reorderPoint', () => {
    expect(SupplySchema.safeParse({ ...valid, reorderPoint: -1 }).success).toBe(false);
  });
  it('rejects negative currentQty', () => {
    expect(SupplySchema.safeParse({ ...valid, currentQty: -1 }).success).toBe(false);
  });
  it('rejects empty unit', () => {
    expect(SupplySchema.safeParse({ ...valid, unit: '' }).success).toBe(false);
  });
});
