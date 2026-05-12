import { describe, it, expect } from 'vitest';
import { isSafeRelative } from '@/lib/safe-redirect';

describe('isSafeRelative', () => {
  it('accepts simple paths', () => {
    expect(isSafeRelative('/')).toBe(true);
    expect(isSafeRelative('/admin')).toBe(true);
    expect(isSafeRelative('/admin/ventas/123')).toBe(true);
  });

  it('rejects protocol-relative URLs', () => {
    expect(isSafeRelative('//evil.com/admin')).toBe(false);
  });

  it('rejects absolute http(s) URLs', () => {
    expect(isSafeRelative('https://evil.com')).toBe(false);
    expect(isSafeRelative('http://evil.com')).toBe(false);
  });

  it('rejects javascript: scheme', () => {
    expect(isSafeRelative('javascript:alert(1)')).toBe(false);
  });

  it('rejects empty, null, non-string and bare names', () => {
    expect(isSafeRelative('')).toBe(false);
    expect(isSafeRelative(null)).toBe(false);
    expect(isSafeRelative(undefined)).toBe(false);
    expect(isSafeRelative('admin')).toBe(false);
  });
});
