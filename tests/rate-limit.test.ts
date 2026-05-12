import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _resetRateLimitForTests } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => _resetRateLimitForTests());

  it('allows up to the limit then blocks', () => {
    const cfg = { key: 'ip:1', limit: 3, windowMs: 1000 };
    expect(rateLimit(cfg).allowed).toBe(true);
    expect(rateLimit(cfg).allowed).toBe(true);
    expect(rateLimit(cfg).allowed).toBe(true);
    expect(rateLimit(cfg).allowed).toBe(false);
  });

  it('isolates keys', () => {
    const a = { key: 'ip:a', limit: 1, windowMs: 1000 };
    const b = { key: 'ip:b', limit: 1, windowMs: 1000 };
    expect(rateLimit(a).allowed).toBe(true);
    expect(rateLimit(b).allowed).toBe(true);
    expect(rateLimit(a).allowed).toBe(false);
    expect(rateLimit(b).allowed).toBe(false);
  });

  it('resets after window expires (uses now param)', () => {
    const cfg = { key: 'ip:1', limit: 2, windowMs: 1000 };
    expect(rateLimit(cfg, 0).allowed).toBe(true);
    expect(rateLimit(cfg, 100).allowed).toBe(true);
    expect(rateLimit(cfg, 500).allowed).toBe(false);
    expect(rateLimit(cfg, 1500).allowed).toBe(true); // window slid, oldest hit expired
  });

  it('returns remaining + resetAt', () => {
    const cfg = { key: 'ip:1', limit: 3, windowMs: 1000 };
    const r1 = rateLimit(cfg, 0);
    expect(r1.remaining).toBe(2);
    expect(r1.resetAt).toBe(1000);
    const r2 = rateLimit(cfg, 200);
    expect(r2.remaining).toBe(1);
    expect(r2.resetAt).toBe(1000); // resetAt = oldest hit + windowMs
  });
});
