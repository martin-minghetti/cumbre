import { describe, it, expect, vi, beforeEach } from 'vitest';

const txExecute = vi.fn();
const txInsertBatch = vi.fn();
const txInsertStock = vi.fn();
const txInsertSupplyMov = vi.fn();
const txUpdateSupplyQty = vi.fn();

vi.mock('@/db', () => ({
  db: {
    transaction: async (cb: any) => {
      const tx = {
        execute: txExecute,
        insert: (table: any) => ({
          values: (vals: any) => {
            if (table?._?.name === 'batches' || table === 'batches') {
              txInsertBatch(vals);
              return { returning: () => [{ id: 999 }] };
            }
            if (table?._?.name === 'stock_movements' || table === 'stock_movements') {
              txInsertStock(vals);
              return Promise.resolve();
            }
            if (table?._?.name === 'supply_movements' || table === 'supply_movements') {
              txInsertSupplyMov(vals);
              return Promise.resolve();
            }
            return Promise.resolve();
          },
        }),
        update: () => ({
          set: (v: any) => ({
            where: () => { txUpdateSupplyQty(v); return Promise.resolve(); },
          }),
        }),
      };
      return cb(tx);
    },
  },
}));

vi.mock('@/db/schema', () => {
  const tag = (name: string) => ({ _: { name } });
  return {
    batches: tag('batches'),
    stockMovements: tag('stock_movements'),
    supplyMovements: tag('supply_movements'),
    supplies: tag('supplies'),
  };
});

import { produceBatch, ProductionInsufficientSupplyError } from '@/lib/admin/production';

describe('produceBatch', () => {
  beforeEach(() => {
    txExecute.mockReset();
    txInsertBatch.mockReset();
    txInsertStock.mockReset();
    txInsertSupplyMov.mockReset();
    txUpdateSupplyQty.mockReset();
  });

  const validInput = {
    productId: 1,
    lotCode: 'IPA-260514-01',
    bottledAt: new Date('2026-05-14T10:00:00Z'),
    abv: 62,
    ibu: 62,
    volumeProducedL: 800,
    unitsProduced: 1700,
    costTotalCents: 50000000,
    notes: 'lote test',
    consumption: [
      { supplyId: 1, qty: 100 },
      { supplyId: 2, qty: 5 },
    ],
    createdBy: 1,
  };

  it('happy path: inserts batch + stock_movement + supply_movements + updates supply qty', async () => {
    txExecute.mockResolvedValueOnce({ rows: [{ id: 1, current_qty: 500 }, { id: 2, current_qty: 50 }] });
    const result = await produceBatch(validInput);
    expect(result.batchId).toBe(999);
    expect(txInsertBatch).toHaveBeenCalledTimes(1);
    expect(txInsertStock).toHaveBeenCalledTimes(1);
    expect(txInsertSupplyMov).toHaveBeenCalledTimes(1);
    expect(txUpdateSupplyQty).toHaveBeenCalledTimes(2);
  });

  it('throws InsufficientSupplyError when a supply does not have enough', async () => {
    txExecute.mockResolvedValueOnce({ rows: [{ id: 1, current_qty: 50 }, { id: 2, current_qty: 50 }] });
    await expect(produceBatch(validInput)).rejects.toThrow(ProductionInsufficientSupplyError);
  });

  it('does not allow duplicate supplyId in consumption (collapses or rejects)', async () => {
    const bad = { ...validInput, consumption: [{ supplyId: 1, qty: 100 }, { supplyId: 1, qty: 50 }] };
    await expect(produceBatch(bad)).rejects.toThrow(/duplicate supply/i);
  });

  it('rejects negative qty in consumption', async () => {
    const bad = { ...validInput, consumption: [{ supplyId: 1, qty: -5 }] };
    await expect(produceBatch(bad)).rejects.toThrow();
  });
});
