import { describe, it, expect } from 'vitest';
import { channelFilterSchema, type Channel } from '@/lib/admin/unified-sales';

describe('unified-sales schemas', () => {
  it('accepts all/online/pos', () => {
    expect(channelFilterSchema.safeParse('all').success).toBe(true);
    expect(channelFilterSchema.safeParse('online').success).toBe(true);
    expect(channelFilterSchema.safeParse('pos').success).toBe(true);
  });
  it('rejects junk', () => {
    expect(channelFilterSchema.safeParse('crypto').success).toBe(false);
  });

  it('Channel type union compiles', () => {
    const c: Channel = 'all';
    expect(['all', 'online', 'pos']).toContain(c);
  });
});
