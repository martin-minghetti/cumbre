type Config = { key: string; limit: number; windowMs: number };

const hits = new Map<string, number[]>();

export function rateLimit(cfg: Config, nowOverride?: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = nowOverride ?? Date.now();
  const cutoff = now - cfg.windowMs;
  const arr = (hits.get(cfg.key) ?? []).filter((t) => t > cutoff);
  if (arr.length >= cfg.limit) {
    hits.set(cfg.key, arr);
    const oldest = arr[0];
    return { allowed: false, remaining: 0, resetAt: oldest + cfg.windowMs };
  }
  arr.push(now);
  hits.set(cfg.key, arr);
  const oldest = arr[0];
  return { allowed: true, remaining: cfg.limit - arr.length, resetAt: oldest + cfg.windowMs };
}

export function _resetRateLimitForTests(): void {
  hits.clear();
}

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
