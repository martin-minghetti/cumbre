import { describe, it, expect, vi, beforeEach } from 'vitest';

const { dbMock, fifoData } = vi.hoisted(() => {
  const dbMock: {
    transaction: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
  } = {
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(dbMock)),
    insert: vi.fn(),
    select: vi.fn(),
    execute: vi.fn(),
  };
  const fifoData = {
    lockBatchesForProductsFifo: vi.fn(),
    applyMovements: vi.fn(),
  };
  return { dbMock, fifoData };
});

vi.mock('@/db', () => ({ db: dbMock }));
vi.mock('@/lib/order-paid/data', () => fifoData);

import { posSaleSchema, createPosSale } from '@/lib/admin/pos-sale';

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.transaction.mockImplementation(async (fn) => fn(dbMock));
});

describe('posSaleSchema', () => {
  it('accepts valid payload', () => {
    const r = posSaleSchema.safeParse({
      cashSessionId: 1,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 2, unitPriceCents: 3800 }],
    });
    expect(r.success).toBe(true);
  });
  it('rejects empty items', () => {
    expect(posSaleSchema.safeParse({ cashSessionId: 1, paymentMethod: 'cash', items: [] }).success).toBe(false);
  });
  it('rejects qty <= 0', () => {
    const r = posSaleSchema.safeParse({
      cashSessionId: 1,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 0, unitPriceCents: 100 }],
    });
    expect(r.success).toBe(false);
  });
  it('rejects unknown payment method', () => {
    expect(posSaleSchema.safeParse({
      cashSessionId: 1,
      paymentMethod: 'crypto',
      items: [{ packDefinitionId: 1, qty: 1, unitPriceCents: 100 }],
    }).success).toBe(false);
  });
});

describe('createPosSale', () => {
  it('returns session_closed error when session is closed', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 1, closedAt: new Date(), openedBy: 7 }]),
    };
    dbMock.select.mockReturnValue(selectChain);

    const r = await createPosSale({
      cashSessionId: 1,
      cashierId: 7,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 1, unitPriceCents: 100 }],
    });
    expect(r).toEqual({ ok: false, error: 'session_closed' });
  });

  it('returns wrong_cashier when session belongs to another user', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 1, closedAt: null, openedBy: 99 }]),
    };
    dbMock.select.mockReturnValue(selectChain);

    const r = await createPosSale({
      cashSessionId: 1,
      cashierId: 7,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 1, unitPriceCents: 100 }],
    });
    expect(r).toEqual({ ok: false, error: 'wrong_cashier' });
  });

  it('returns insufficient_stock when FIFO cannot allocate', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 1, closedAt: null, openedBy: 7 }]),
    };
    dbMock.select.mockReturnValue(selectChain);

    dbMock.execute.mockResolvedValueOnce({
      rows: [{ packDefinitionId: 1, productId: 5, packSize: 1, priceCents: 3800 }],
    });

    fifoData.lockBatchesForProductsFifo.mockResolvedValue(new Map([[5, []]]));

    const r = await createPosSale({
      cashSessionId: 1,
      cashierId: 7,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 1, unitPriceCents: 3800 }],
    });
    expect(r).toEqual({ ok: false, error: 'insufficient_stock' });
  });

  it('returns ok with saleId + totalCents on happy path', async () => {
    // Session lookup
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 1, closedAt: null, openedBy: 7 }]),
    };
    dbMock.select.mockReturnValue(selectChain);

    // Pack metadata lookup
    dbMock.execute.mockResolvedValueOnce({
      rows: [{ packDefinitionId: 1, productId: 5, packSize: 1, priceCents: 3800 }],
    });

    // FIFO returns enough stock
    fifoData.lockBatchesForProductsFifo.mockResolvedValue(
      new Map([[5, [{ batchId: 10, available: 100 }]]]),
    );

    // posSales insert returning saleId
    // posSaleItems insert (no return)
    // stockMovements insert (no return)
    const returningFn = vi.fn().mockResolvedValue([{ id: 42 }]);
    const valuesFn1 = vi.fn().mockReturnValue({ returning: returningFn });
    const valuesFn2 = vi.fn().mockResolvedValue(undefined);
    const valuesFn3 = vi.fn().mockResolvedValue(undefined);
    dbMock.insert
      .mockReturnValueOnce({ values: valuesFn1 }) // posSales
      .mockReturnValueOnce({ values: valuesFn2 }) // posSaleItems
      .mockReturnValueOnce({ values: valuesFn3 }); // stockMovements

    const r = await createPosSale({
      cashSessionId: 1,
      cashierId: 7,
      paymentMethod: 'cash',
      items: [{ packDefinitionId: 1, qty: 2, unitPriceCents: 3800 }],
    });

    expect(r).toEqual({ ok: true, saleId: 42, totalCents: 7600 });
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(dbMock.insert).toHaveBeenCalledTimes(3); // posSales + posSaleItems + stockMovements
  });
});
