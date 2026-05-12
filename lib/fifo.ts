export type BatchAvailability = { batchId: number; available: number };
export type Allocation = { batchId: number; qty: number };

export class InsufficientStockError extends Error {
  required: number;
  totalAvailable: number;
  constructor(required: number, totalAvailable: number) {
    super(`insufficient stock: required ${required}, available ${totalAvailable}`);
    this.name = 'InsufficientStockError';
    this.required = required;
    this.totalAvailable = totalAvailable;
  }
}

/**
 * FIFO allocator: takes required qty + batches in desired allocation order (caller
 * is responsible for FIFO ordering — usually `ORDER BY bottled_at ASC`).
 * Returns an array of allocations summing to qty, or throws InsufficientStockError
 * if total available < required.
 */
export function allocateFifo(qty: number, batches: BatchAvailability[]): Allocation[] {
  if (qty <= 0) return [];
  const total = batches.reduce((s, b) => s + Math.max(0, b.available), 0);
  if (total < qty) throw new InsufficientStockError(qty, total);

  const out: Allocation[] = [];
  let remaining = qty;
  for (const b of batches) {
    if (remaining <= 0) break;
    if (b.available <= 0) continue;
    const take = Math.min(b.available, remaining);
    out.push({ batchId: b.batchId, qty: take });
    remaining -= take;
  }
  return out;
}
