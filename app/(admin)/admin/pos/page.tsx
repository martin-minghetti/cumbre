import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { currentUser } from '@/lib/auth/current-user';
import { getOpenSessionForUser } from '@/lib/admin/cash-sessions';
import { getPosCatalog } from '@/lib/admin/pos-catalog';
import { PosGrid } from '@/components/admin/PosGrid';

export const dynamic = 'force-dynamic';

export default async function PosPage() {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);
  const open = await getOpenSessionForUser(user.id);
  if (!open) redirect('/admin/pos/no-session' as Route);

  const catalog = await getPosCatalog();
  return <PosGrid catalog={catalog} cashSessionId={open.id} />;
}
