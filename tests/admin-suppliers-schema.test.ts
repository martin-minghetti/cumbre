import { describe, it, expect } from 'vitest';
import { SupplierSchema } from '@/lib/admin/suppliers';

describe('SupplierSchema', () => {
  const valid = {
    name: 'Maltas del Sur SA',
    contactName: 'Juan Perez',
    email: 'juan@maltas.com',
    phone: '+54 11 1234 5678',
    address: 'Av. Siempre Viva 123, CABA',
    cuit: '30-12345678-9',
    notes: 'Entrega martes y viernes',
  };

  it('accepts valid input', () => {
    expect(SupplierSchema.safeParse(valid).success).toBe(true);
  });

  it('requires name (min 2)', () => {
    expect(SupplierSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(SupplierSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('allows null/empty optional fields', () => {
    const minimal = {
      name: 'Solo Nombre',
      contactName: null,
      email: null,
      phone: null,
      address: null,
      cuit: null,
      notes: null,
    };
    expect(SupplierSchema.safeParse(minimal).success).toBe(true);
  });

  it('rejects malformed email', () => {
    expect(SupplierSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('accepts empty string email (treated as null)', () => {
    const r = SupplierSchema.safeParse({ ...valid, email: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBeNull();
  });
});
