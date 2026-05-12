import { cookies } from 'next/headers';
import { verifyCart, totalQty } from '@/lib/cart';

export async function CartBadge() {
  const store = await cookies();
  const token = store.get('cart')?.value;
  const cart = token ? await verifyCart(token) : null;
  const n = cart ? totalQty(cart) : 0;
  return (
    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] text-bg">
      {n > 99 ? '99+' : n}
    </span>
  );
}
