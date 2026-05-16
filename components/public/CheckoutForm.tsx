'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ShippingOption } from '@/lib/shipping';

type CartItem = {
  packId: number;
  qty: number;
  unitPriceCents: number;
  productName: string;
  packLabel: string;
};

type Props = {
  items: CartItem[];
  shippingOptions: ShippingOption[];
  paymentMode: 'simulated' | 'production';
};

export function CheckoutForm({ items, shippingOptions, paymentMode }: Props) {
  const [selected, setSelected] = useState<string>(
    shippingOptions[0]
      ? shippingOptions[0].method === 'pickup'
        ? 'pickup'
        : `delivery:${(shippingOptions[0] as Extract<ShippingOption, { method: 'delivery_local' }>).zoneName}`
      : 'pickup',
  );
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('San Carlos de Bariloche');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.qty, 0);
  const shippingCents =
    selected === 'pickup'
      ? 0
      : (shippingOptions.find(
          (o) => o.method === 'delivery_local' && `delivery:${o.zoneName}` === selected,
        ) as Extract<ShippingOption, { method: 'delivery_local' }> | undefined)?.cost_cents ?? 0;
  const total = subtotal + shippingCents;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const isPickup = selected === 'pickup';
    const zoneName = isPickup ? undefined : selected.replace(/^delivery:/, '');
    start(async () => {
      const r = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { email, name, phone },
          shippingMethod: isPickup ? 'pickup' : 'delivery_local',
          zoneName,
          shippingAddress: isPickup ? null : { street, city },
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? 'error_checkout');
        return;
      }
      // External URLs (MP) need a full navigation, not Next router push
      if (typeof j.redirectUrl === 'string' && /^https?:\/\//.test(j.redirectUrl)) {
        window.location.href = j.redirectUrl;
      } else {
        router.push(j.redirectUrl);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">01 · Envío</h2>
          <div className="mt-4 space-y-3">
            {shippingOptions.map((opt) => {
              const value = opt.method === 'pickup' ? 'pickup' : `delivery:${opt.zoneName}`;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-4 border p-4 transition ${
                    selected === value ? 'border-accent bg-accent/5' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={value}
                    checked={selected === value}
                    onChange={() => setSelected(value)}
                    className="mt-1 accent-accent"
                  />
                  <div className="flex-1">
                    <div className="font-display text-lg uppercase tracking-tight text-text-inverse">
                      {opt.label}
                    </div>
                    <div className="font-mono text-xs text-muted">
                      {opt.method === 'pickup' ? opt.description : 'Envío local zonificado'}
                    </div>
                  </div>
                  <div className="font-mono text-sm text-text-inverse">
                    {opt.cost_cents === 0 ? 'Gratis' : `$${(opt.cost_cents / 100).toLocaleString('es-AR')}`}
                  </div>
                </label>
              );
            })}
          </div>

          {selected.startsWith('delivery:') && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Calle y número" value={street} onChange={setStreet} required />
              <Field label="Ciudad" value={city} onChange={setCity} required />
            </div>
          )}
        </section>

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">02 · Tus datos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Nombre completo" value={name} onChange={setName} required />
            <Field label="Teléfono" value={phone} onChange={setPhone} required />
          </div>
        </section>

        {error && (
          <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300">
            {error === 'insufficient_stock'
              ? 'Uno de los productos se quedó sin stock mientras armabas el pedido. Volvé al carrito.'
              : error === 'rate_limited'
                ? 'Estás reintentando muy rápido. Esperá un minuto.'
                : `Error: ${error}`}
          </div>
        )}
      </div>

      <aside className="border border-line p-6 lg:sticky lg:top-24 lg:self-start">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Resumen</div>
        <ul className="mt-4 space-y-3 border-b border-line pb-4">
          {items.map((i) => (
            <li key={i.packId} className="flex items-start justify-between font-mono text-xs text-muted">
              <span>
                <span className="text-text-inverse">{i.qty}×</span> {i.productName}
                <br />
                <span className="text-muted">{i.packLabel}</span>
              </span>
              <span className="text-text-inverse">${((i.unitPriceCents * i.qty) / 100).toLocaleString('es-AR')}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Envío</span>
            <span>{shippingCents === 0 ? 'Gratis' : `$${(shippingCents / 100).toLocaleString('es-AR')}`}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-2xl text-text-inverse">
            <span>Total</span>
            <span className="text-accent">${(total / 100).toLocaleString('es-AR')}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 block w-full bg-accent px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-bg transition hover:bg-paper disabled:opacity-50"
        >
          {pending ? 'procesando…' : 'pagar →'}
        </button>
        <p className="mt-3 font-mono text-[10px] text-muted">
          {paymentMode === 'production'
            ? 'Te redirigimos a Mercado Pago para completar el pago.'
            : 'Demo: vas a ver una pantalla simulada de pago, no se cobra nada real.'}
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 block w-full border border-line bg-transparent px-3 py-2 font-body text-text-inverse focus:border-accent focus:outline-none"
      />
    </label>
  );
}
