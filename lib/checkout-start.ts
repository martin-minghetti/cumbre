import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders, packDefinitions, products } from '@/db/schema';
import { computeTotals } from '@/lib/checkout-totals';
import { upsertCustomer } from '@/lib/order-paid/data';
import { getShippingCost, type ShippingMethod } from '@/lib/shipping';
import { allocateFifo, InsufficientStockError } from '@/lib/fifo';
import { getBatchesForProductFifo } from '@/lib/stock';
import { createMpPreference, isMpEnabled } from '@/lib/mp';
import type { Cart } from '@/lib/cart';

export type StartArgs = {
  cart: Cart;
  customer: { email: string; name: string; phone: string };
  shippingMethod: ShippingMethod;
  zoneName?: string;
  shippingAddress?: object | null;
};

export type StartResult = { orderId: number; redirectUrl: string };

export async function startCheckout(args: StartArgs): Promise<StartResult> {
  if (args.cart.lines.length === 0) throw new Error('empty_cart');

  // Resolve packs + products
  const packs = await db
    .select({
      id: packDefinitions.id,
      size: packDefinitions.size,
      priceCents: packDefinitions.priceCents,
      productId: packDefinitions.productId,
      productName: products.name,
      format: products.format,
    })
    .from(packDefinitions)
    .innerJoin(products, eq(packDefinitions.productId, products.id))
    .where(inArray(packDefinitions.id, args.cart.lines.map((l) => l.packId)));
  if (packs.length !== args.cart.lines.length) throw new Error('invalid_pack');

  const packMap = new Map(packs.map((p) => [p.id, p]));

  // Stock pre-check (best-effort; webhook re-checks under lock)
  const productQty = new Map<number, number>();
  for (const l of args.cart.lines) {
    const pk = packMap.get(l.packId)!;
    productQty.set(pk.productId, (productQty.get(pk.productId) ?? 0) + l.qty);
  }
  for (const [productId, qty] of productQty) {
    const fifo = await getBatchesForProductFifo(productId);
    try {
      allocateFifo(qty, fifo);
    } catch (e) {
      if (e instanceof InsufficientStockError) throw new Error('insufficient_stock');
      throw e;
    }
  }

  // Compute totals
  const totals = computeTotals({
    lines: args.cart.lines.map((l) => {
      const pk = packMap.get(l.packId)!;
      return { packId: l.packId, qty: l.qty, unitPriceCents: pk.priceCents };
    }),
    shippingMethod: args.shippingMethod,
    zoneName: args.zoneName,
  });
  // Re-derive shipping cost via lib (already inside computeTotals, but assert)
  void getShippingCost(args.shippingMethod, args.zoneName);

  // Upsert customer
  const customerId = await upsertCustomer({
    email: args.customer.email,
    name: args.customer.name,
    phone: args.customer.phone,
    address: args.shippingAddress ?? null,
  });

  // Create order in TX
  const orderId = await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(orders)
      .values({
        customerId,
        status: 'pending',
        channel: 'online',
        shippingMethod: args.shippingMethod,
        shippingAddress: args.shippingAddress ?? null,
        shippingCostCents: totals.shippingCents,
        subtotalCents: totals.subtotalCents,
        totalCents: totals.totalCents,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      totals.items.map((it) => ({
        orderId: o.id,
        packDefinitionId: it.packId,
        qty: it.qty,
        unitPriceCents: it.unitPriceCents,
        lineTotalCents: it.lineTotalCents,
      })),
    );
    return o.id;
  });

  // Build redirect URL: MP preference or simulated route
  const successUrl = `${publicBaseUrl()}/checkout/exito`;
  if (isMpEnabled()) {
    const initPoint = await createMpPreference({
      orderId,
      items: totals.items.map((it) => {
        const pk = packMap.get(it.packId)!;
        return {
          title: `${pk.productName} · ${pk.size === 1 ? 'unidad' : `pack ${pk.size}`}`,
          quantity: it.qty,
          unitPriceCents: it.unitPriceCents,
        };
      }),
      shippingCents: totals.shippingCents,
      customerEmail: args.customer.email,
      successUrl,
      failureUrl: `${publicBaseUrl()}/checkout?status=failure`,
      pendingUrl: `${publicBaseUrl()}/checkout?status=pending`,
    });
    return { orderId, redirectUrl: initPoint };
  }
  return { orderId, redirectUrl: `/checkout/simulated/${orderId}` };
}

function publicBaseUrl(): string {
  const v = process.env.VERCEL_URL;
  return v ? `https://${v}` : 'http://localhost:3000';
}
