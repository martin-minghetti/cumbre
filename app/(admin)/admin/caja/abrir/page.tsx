import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { currentUser } from '@/lib/auth/current-user';
import { getOpenSessionForUser } from '@/lib/admin/cash-sessions';
import { openSessionAction } from '../actions';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AbrirCajaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await currentUser();
  if (!user) redirect('/admin-login' as Route);
  const open = await getOpenSessionForUser(user.id);
  if (open) redirect('/admin/caja' as Route);
  const sp = await searchParams;

  return (
    <div className="p-8 space-y-8 max-w-md">
      <AdminPageHeader
        eyebrow="Caja / Apertura"
        title="Abrir caja"
      />
      <Card>
        <CardContent>
          <form action={openSessionAction} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="openingAmountCents">Monto inicial (centavos ARS)</Label>
              <Input id="openingAmountCents" name="openingAmountCents" type="number" min={0} required defaultValue={0} />
              <p className="text-xs text-muted-foreground">Ej: 10000 = $100,00</p>
            </div>
            {sp.error === 'invalid' && <p className="text-sm text-destructive">Monto invalido.</p>}
            <Button type="submit">Abrir</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
