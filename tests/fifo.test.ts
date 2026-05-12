import { describe, it, expect } from 'vitest';
import { allocateFifo, InsufficientStockError } from '@/lib/fifo';

describe('allocateFifo', () => {
  it('single batch suficiente', () => {
    const res = allocateFifo(5, [
      { batchId: 10, available: 20 },
    ]);
    expect(res).toEqual([{ batchId: 10, qty: 5 }]);
  });

  it('split across two batches', () => {
    const res = allocateFifo(15, [
      { batchId: 10, available: 8 },
      { batchId: 12, available: 20 },
    ]);
    expect(res).toEqual([
      { batchId: 10, qty: 8 },
      { batchId: 12, qty: 7 },
    ]);
  });

  it('exact fit across multiple batches', () => {
    const res = allocateFifo(10, [
      { batchId: 1, available: 3 },
      { batchId: 2, available: 4 },
      { batchId: 3, available: 3 },
    ]);
    expect(res).toEqual([
      { batchId: 1, qty: 3 },
      { batchId: 2, qty: 4 },
      { batchId: 3, qty: 3 },
    ]);
  });

  it('throws InsufficientStockError when total < required', () => {
    expect(() => allocateFifo(20, [{ batchId: 1, available: 5 }])).toThrow(InsufficientStockError);
  });

  it('skips empty batches', () => {
    const res = allocateFifo(5, [
      { batchId: 1, available: 0 },
      { batchId: 2, available: 10 },
    ]);
    expect(res).toEqual([{ batchId: 2, qty: 5 }]);
  });

  it('qty=0 returns empty allocation', () => {
    expect(allocateFifo(0, [{ batchId: 1, available: 10 }])).toEqual([]);
  });

  it('preserves batch order', () => {
    const res = allocateFifo(3, [
      { batchId: 99, available: 2 },
      { batchId: 5, available: 5 },
    ]);
    expect(res).toEqual([
      { batchId: 99, qty: 2 },
      { batchId: 5, qty: 1 },
    ]);
  });
});
