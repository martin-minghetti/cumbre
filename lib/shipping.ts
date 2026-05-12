import { brand } from '@/config/brand';

export type ShippingMethod = 'delivery_local' | 'pickup';

export type ShippingOption =
  | { method: 'pickup'; cost_cents: 0; label: string; description: string }
  | { method: 'delivery_local'; zoneName: string; cost_cents: number; label: string };

export function getShippingOptions(): ShippingOption[] {
  const opts: ShippingOption[] = [];
  if (brand.shipping.pickup.enabled) {
    opts.push({
      method: 'pickup',
      cost_cents: 0,
      label: 'Retiro en local',
      description: `${brand.shipping.pickup.address} · ${brand.shipping.pickup.hours}`,
    });
  }
  if (brand.shipping.delivery.enabled) {
    for (const z of brand.shipping.delivery.zones) {
      opts.push({
        method: 'delivery_local',
        zoneName: z.name,
        cost_cents: z.cost_cents,
        label: z.name,
      });
    }
  }
  return opts;
}

export function getShippingCost(method: ShippingMethod, zoneName?: string): number {
  if (method === 'pickup') return 0;
  if (method === 'delivery_local') {
    const z = brand.shipping.delivery.zones.find((zz) => zz.name === zoneName);
    if (!z) throw new Error(`unknown shipping zone: ${zoneName}`);
    return z.cost_cents;
  }
  throw new Error(`unknown shipping method: ${method}`);
}
