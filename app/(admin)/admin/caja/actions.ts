'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { currentUser } from '@/lib/auth/current-user';
import {
  closingAmountSchema,
  openingAmountSchema,
  openCashSession,
  closeCashSession,
} from '@/lib/admin/cash-sessions';

export async function openSessionAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);

  const openingRaw = formData.get('openingAmountCents');
  const parsed = openingAmountSchema.safeParse({
    openingAmountCents: openingRaw == null ? NaN : Number(openingRaw),
  });
  if (!parsed.success) redirect('/admin/caja/abrir?error=invalid' as Route);

  const r = await openCashSession({
    userId: user.id,
    openingAmountCents: parsed.data.openingAmountCents,
  });
  if (!r.ok) redirect('/admin/caja?error=already_open' as Route);

  revalidatePath('/admin/caja');
  revalidatePath('/admin/pos');
  redirect('/admin/pos' as Route);
}

export async function closeSessionAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);

  const sessionIdRaw = formData.get('sessionId');
  const counted = formData.get('closingAmountCountedCents');
  const notes = String(formData.get('notes') ?? '');
  const parsed = closingAmountSchema.safeParse({
    closingAmountCountedCents: counted == null ? NaN : Number(counted),
    notes,
  });
  if (!parsed.success) redirect('/admin/caja/cerrar?error=invalid' as Route);

  const r = await closeCashSession({
    sessionId: Number(sessionIdRaw),
    userId: user.id,
    closingAmountCountedCents: parsed.data.closingAmountCountedCents,
    notes: parsed.data.notes,
  });
  if (!r.ok) redirect(`/admin/caja?error=${r.error}` as Route);

  revalidatePath('/admin/caja');
  redirect('/admin/caja' as Route);
}
