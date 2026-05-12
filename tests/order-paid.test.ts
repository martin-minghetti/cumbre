import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory mock state shared across mocks.
const txState = {
  orders: new Map<number, { id: number; status: string; mpPaymentId: string | null; subtotalCents: number; shippingCostCents: number; totalCents: number; customerId: number }>(),
  orderItems: new Map<number, { id: number; orderId: number; packDefinitionId: number; qty: number; unitPriceCents: number; lineTotalCents: number }[]>(),
  customers: new Map<number, { id: number; email: string; name: string }>(),
  stockMovements: [] as { productId: number; batchId: number; delta: number; reason: string; referenceId: number | null }[],
  batches: [] as { id: number; productId: number; available: number; bottledAt: Date }[],
  packs: new Map<number, { id: number; productId: number; priceCents: number; size: number }>(),
  products: new Map<number, { id: number; name: string; format: string }>(),
  emails: [] as { to: string; subject: string }[],
};

vi.mock('@/db', () => ({
  db: {
    transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(undefined),
  },
}));

vi.mock('@/lib/order-paid/data', () => ({
  loadOrderForPaid: vi.fn(async (orderId: number) => {
    const o = txState.orders.get(orderId);
    if (!o) return null;
    const items = txState.orderItems.get(orderId) ?? [];
    return {
      order: o,
      items: items.map((it) => {
        const pack = txState.packs.get(it.packDefinitionId)!;
        const product = txState.products.get(pack.productId)!;
        return { ...it, productId: pack.productId, productName: product.name, packSize: pack.size, format: product.format };
      }),
      customer: txState.customers.get(o.customerId)!,
    };
  }),
  lockBatchesForProductsFifo: vi.fn(async (productIds: number[]) => {
    const out = new Map<number, { batchId: number; available: number }[]>();
    for (const pid of productIds) {
      out.set(
        pid,
        txState.batches
          .filter((b) => b.productId === pid && b.available > 0)
          .sort((a, b) => a.bottledAt.getTime() - b.bottledAt.getTime())
          .map((b) => ({ batchId: b.id, available: b.available })),
      );
    }
    return out;
  }),
  applyMovements: vi.fn(async (movs: typeof txState.stockMovements) => {
    for (const m of movs) {
      txState.stockMovements.push(m);
      const b = txState.batches.find((bb) => bb.id === m.batchId);
      if (b) b.available += m.delta;
    }
  }),
  markOrderPaid: vi.fn(async (orderId: number, mpPaymentId: string, _paymentStatus: string) => {
    const o = txState.orders.get(orderId);
    if (!o) throw new Error('not found');
    if (o.mpPaymentId) {
      if (o.mpPaymentId === mpPaymentId) return false;
      throw new Error('mp_payment_id conflict');
    }
    o.mpPaymentId = mpPaymentId;
    o.status = 'paid';
    return true;
  }),
  markOrderCancelled: vi.fn(async (orderId: number) => {
    const o = txState.orders.get(orderId);
    if (o) o.status = 'cancelled';
  }),
  upsertCustomer: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(async (args: { to: string; subject: string }) => {
    txState.emails.push({ to: args.to, subject: args.subject });
  }),
  renderOrderPaidCustomer: () => '<html>customer</html>',
  renderOrderPaidOwner: () => '<html>owner</html>',
  escapeHtml: (s: string) => s,
}));

vi.mock('@/lib/order-token', () => ({
  signOrderToken: async () => 'token-abc',
}));

vi.mock('@/lib/env', () => ({
  env: {
    OWNER_EMAIL: 'owner@x.com',
    CART_SECRET: 'a'.repeat(32),
    SESSION_SECRET: 'a'.repeat(32),
    ORDER_TOKEN_SECRET: 'a'.repeat(32),
    RESEND_API_KEY: undefined,
    PAYMENT_MODE: 'simulated',
  },
}));

const { applyOrderPaid } = await import('@/lib/order-paid');

function seed() {
  txState.orders.clear();
  txState.orderItems.clear();
  txState.customers.clear();
  txState.stockMovements.length = 0;
  txState.batches.length = 0;
  txState.packs.clear();
  txState.products.clear();
  txState.emails.length = 0;

  txState.products.set(1, { id: 1, name: 'Cumbre IPA', format: 'lata_473' });
  txState.packs.set(10, { id: 10, productId: 1, priceCents: 200_000, size: 1 });
  txState.batches.push(
    { id: 100, productId: 1, available: 10, bottledAt: new Date('2026-01-01') },
    { id: 101, productId: 1, available: 50, bottledAt: new Date('2026-02-01') },
  );
  txState.customers.set(1, { id: 1, email: 'cliente@x.com', name: 'Cliente' });
  txState.orders.set(42, {
    id: 42,
    status: 'pending',
    mpPaymentId: null,
    subtotalCents: 600_000,
    shippingCostCents: 0,
    totalCents: 600_000,
    customerId: 1,
  });
  txState.orderItems.set(42, [
    { id: 1, orderId: 42, packDefinitionId: 10, qty: 3, unitPriceCents: 200_000, lineTotalCents: 600_000 },
  ]);
}

describe('applyOrderPaid', () => {
  beforeEach(seed);

  it('happy path: marks paid + emits FIFO + emails customer + owner', async () => {
    const r = await applyOrderPaid({ orderId: 42, mpPaymentId: 'mp-1', paymentStatus: 'approved' });
    expect(r.applied).toBe(true);
    expect(txState.orders.get(42)!.status).toBe('paid');
    expect(txState.stockMovements.map((m) => ({ b: m.batchId, d: m.delta }))).toEqual([
      { b: 100, d: -3 }, // oldest batch consumed first
    ]);
    expect(txState.emails.length).toBe(2);
  });

  it('idempotent: same mp_payment_id second call is no-op', async () => {
    await applyOrderPaid({ orderId: 42, mpPaymentId: 'mp-1', paymentStatus: 'approved' });
    const r = await applyOrderPaid({ orderId: 42, mpPaymentId: 'mp-1', paymentStatus: 'approved' });
    expect(r.applied).toBe(false);
    expect(txState.stockMovements.length).toBe(1); // not duplicated
    expect(txState.emails.length).toBe(2); // no extra emails on no-op
  });

  it('split FIFO across two batches when first lacks stock', async () => {
    txState.orderItems.get(42)![0].qty = 13;
    txState.orderItems.get(42)![0].lineTotalCents = 13 * 200_000;
    txState.orders.get(42)!.subtotalCents = 13 * 200_000;
    txState.orders.get(42)!.totalCents = 13 * 200_000;

    await applyOrderPaid({ orderId: 42, mpPaymentId: 'mp-1', paymentStatus: 'approved' });
    expect(txState.stockMovements).toEqual([
      expect.objectContaining({ batchId: 100, delta: -10 }),
      expect.objectContaining({ batchId: 101, delta: -3 }),
    ]);
  });

  it('insufficient stock cancels order + alerts owner', async () => {
    txState.batches[0].available = 0;
    txState.batches[1].available = 1;
    txState.orderItems.get(42)![0].qty = 5;

    const r = await applyOrderPaid({ orderId: 42, mpPaymentId: 'mp-1', paymentStatus: 'approved' });
    expect(r.applied).toBe(false);
    expect(r.cancelled).toBe(true);
    expect(txState.orders.get(42)!.status).toBe('cancelled');
    expect(txState.emails.find((e) => e.to === 'owner@x.com')).toBeTruthy();
  });
});
