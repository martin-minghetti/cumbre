import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isSafeRelative } from '@/lib/safe-redirect';
import { DEMO_USERS } from '@/config/demo-users';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect && isSafeRelative(sp.redirect) ? sp.redirect : '/admin';
  const error = sp.error;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-display text-3xl uppercase tracking-tight">
          Cumbre <span className="text-accent">Admin</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm text-red-500">Credenciales invalidas.</p> : null}
          <button
            type="submit"
            className="mt-2 w-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-bg transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
        <div className="mt-6 border-t pt-4 font-mono text-xs">
          <p className="mb-2 uppercase tracking-[0.18em] opacity-60">Cuentas demo</p>
          {DEMO_USERS.map((u) => (
            <p key={u.email} className="leading-relaxed">
              <span className="uppercase opacity-60">{u.role}</span> {u.email} / {u.password}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
