import { describe, it, expect } from 'vitest';
import { ProductUpdateSchema } from '@/lib/admin/products';

describe('ProductUpdateSchema', () => {
  const valid = {
    name: 'IPA Cumbre',
    style: 'IPA',
    format: 'lata_473' as const,
    abvDefault: 65,
    ibuDefault: 50,
    description: 'Una IPA patagónica',
    heroImageUrl: 'https://example.com/hero.jpg',
    reorderPoint: 50,
    active: true,
  };

  it('accepts valid input', () => {
    expect(ProductUpdateSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty name', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, name: '' });
    expect(r.success).toBe(false);
  });

  it('rejects name with less than 2 chars', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, name: 'A' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid format', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, format: 'botella_750' });
    expect(r.success).toBe(false);
  });

  it('rejects negative reorderPoint', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, reorderPoint: -1 });
    expect(r.success).toBe(false);
  });

  it('rejects abvDefault > 200', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, abvDefault: 250 });
    expect(r.success).toBe(false);
  });

  it('accepts null abvDefault and ibuDefault (optional)', () => {
    const r = ProductUpdateSchema.safeParse({
      ...valid,
      abvDefault: null,
      ibuDefault: null,
    });
    expect(r.success).toBe(true);
  });

  it('rejects heroImageUrl that is not a URL', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, heroImageUrl: 'not-a-url' });
    expect(r.success).toBe(false);
  });

  it('accepts empty heroImageUrl (optional)', () => {
    const r = ProductUpdateSchema.safeParse({ ...valid, heroImageUrl: '' });
    expect(r.success).toBe(true);
  });
});
