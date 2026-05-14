import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Catedral IPA')).toBe('catedral-ipa');
  });
  it('strips accents (NFD normalize)', () => {
    expect(slugify('Lopez Helles')).toBe('lopez-helles');
    expect(slugify('Cerveceria Cumbre')).toBe('cerveceria-cumbre');
  });
  it('removes non-alphanumeric characters', () => {
    expect(slugify('IPA #5 (lata 473ml)')).toBe('ipa-5-lata-473ml');
  });
  it('collapses multiple dashes', () => {
    expect(slugify('foo --- bar')).toBe('foo-bar');
  });
  it('trims leading and trailing dashes', () => {
    expect(slugify('--foo--')).toBe('foo');
  });
  it('returns empty string for input with no alphanumerics', () => {
    expect(slugify('!!!')).toBe('');
  });
});
