import { db } from '@/db';
import { allocateFifo, InsufficientStockError } from '@/lib/fifo';
import {
  applyMovements,
  loadOrderForPaid,
  lockBatchesForProductsFifo,
  markOrderCancelled,
  markOrderPaid,
} from '@/lib/order-paid/data';
import { renderOrderPaidCustomer, renderOrderPaidOwner, sendEmail } from '@/lib/email';
import { signOrderToken } from '@/lib/order-token';
import { env } from '@/lib/env';
import { brand } from '@/config/brand';
import { fmtFormat } from '@/lib/products';

export type ApplyResult =
  | { applied: true; cancelled?: false }
  | { applied: false; cancelled?: boolean; reason?: string };

class IdempotentRaceError extends Error {}

function publicBaseUrl(): string {
  const v = process.env.VERCEL_URL;
  if (v) return `https://${v}`;
  return 'http://localhost:3000';
}

/**
 * Idempotent: at most one mp_payment_id per orders row (DB UNIQUE).
 * - Loads order + items + customer.
 * - In a transaction:
 *     - SELECT FOR UPDATE batches for the product set.
 *     - Allocate FIFO per item.
 *     - On insufficient stock: rollback FIFO part, mark order cancelled, alert owner.
 *     - On success: insert stock_movements, mark order paid.
 * - Outside the TX: send confirmation email to customer + owner.
 */
export async function applyOrderPaid(args: {
  orderId: number;
  mpPaymentId: string;
  paymentStatus: string;
}): Promise<ApplyResult> {
  const loaded = await loadOrderForPaid(args.orderId);
  if (!loaded) return { applied: false, reason: 'order_not_found' };

  // Already paid with same mp_payment_id?
  if (loaded.order.mpPaymentId === args.mpPaymentId) {
    return { applied: false, reason: 'already_applied' };
  }
  // Already cancelled?
  if (loaded.order.status === 'cancelled') {
    return { applied: false, reason: 'already_cancelled' };
  }

  const productIds = Array.from(new Set(loaded.items.map((it) => it.productId)));

  try {
    await db.transaction(async () => {
      const batchesByProduct = await lockBatchesForProductsFifo(productIds);

      const movements: {
        productId: number;
        batchId: number;
        delta: number;
        reason: 'sale_online';
        referenceId: number | null;
      }[] = [];

      for (const item of loaded.items) {
        const productBatches = batchesByProduct.get(item.productId) ?? [];
        const allocations = allocateFifo(item.qty, productBatches);
        for (const a of allocations) {
          movements.push({
            productId: item.productId,
            batchId: a.batchId,
            delta: -a.qty,
            reason: 'sale_online',
            referenceId: args.orderId,
          });
          const arr = batchesByProduct.get(item.productId)!;
          const found = arr.find((b) => b.batchId === a.batchId);
          if (found) found.available -= a.qty;
        }
      }

      await applyMovements(movements);
      const flipped = await markOrderPaid(args.orderId, args.mpPaymentId, args.paymentStatus);
      if (!flipped) {
        throw new IdempotentRaceError();
      }
    });
  } catch (e) {
    if (e instanceof InsufficientStockError) {
      await markOrderCancelled(args.orderId);
      await sendEmail({
        to: env.OWNER_EMAIL,
        subject: `[${brand.name}] Order #${args.orderId} cancelada por stock insuficiente`,
        html: renderOrderPaidOwner({
          orderId: args.orderId,
          issue: 'insufficient_stock',
          customerEmail: loaded.customer.email,
          totalCents: loaded.order.totalCents,
        }),
      });
      return { applied: false, cancelled: true, reason: 'insufficient_stock' };
    }
    if (e instanceof IdempotentRaceError) {
      return { applied: false, reason: 'already_applied' };
    }
    throw e;
  }

  // Outside TX: send emails (best-effort; failure here doesn't roll back)
  const token = await signOrderToken(args.orderId);
  const successUrl = `${publicBaseUrl()}/checkout/exito?token=${token}`;
  try {
    await sendEmail({
      to: loaded.customer.email,
      subject: `[${brand.name}] Pedido #${args.orderId} confirmado`,
      html: renderOrderPaidCustomer({
        orderId: args.orderId,
        customerName: loaded.customer.name,
        items: loaded.items.map((it) => ({
          productName: it.productName,
          packLabel:
            it.packSize === 1
              ? `unidad · ${fmtFormat(it.format as 'lata_473' | 'porron_1l')}`
              : `pack ${it.packSize} · ${fmtFormat(it.format as 'lata_473' | 'porron_1l')}`,
          qty: it.qty,
          lineTotalCents: it.lineTotalCents,
        })),
        shippingCents: loaded.order.shippingCostCents,
        totalCents: loaded.order.totalCents,
        successUrl,
      }),
    });
    await sendEmail({
      to: env.OWNER_EMAIL,
      subject: `[${brand.name}] Nuevo pedido pagado #${args.orderId}`,
      html: renderOrderPaidOwner({
        orderId: args.orderId,
        customerEmail: loaded.customer.email,
        totalCents: loaded.order.totalCents,
      }),
    });
  } catch (e) {
    console.error('[order-paid] email send failed:', e);
  }

  return { applied: true };
}
