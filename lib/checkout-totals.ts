import { getShippingCost, type ShippingMethod } from '@/lib/shipping';

export type CheckoutLine = { packId: number; qty: number; unitPriceCents: number };

export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: { packId: number; qty: number; unitPriceCents: number; lineTotalCents: number }[];
};

export function computeTotals(args: {
  lines: CheckoutLine[];
  shippingMethod: ShippingMethod;
  zoneName?: string;
}): Totals {
  const items = args.lines.map((l) => ({
    packId: l.packId,
    qty: l.qty,
    unitPriceCents: l.unitPriceCents,
    lineTotalCents: l.unitPriceCents * l.qty,
  }));
  const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
  const shippingCents = getShippingCost(args.shippingMethod, args.zoneName);
  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    items,
  };
}
