import { brand } from '@/config/brand';
import { isSafeRelative } from '@/lib/safe-redirect';
import { LoginForm } from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: rawRedirect } = await searchParams;
  const redirectTo = isSafeRelative(rawRedirect) ? rawRedirect! : '/admin';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-9 py-16">
      <div className="border border-line p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">— admin</p>
        <h1 className="mt-4 font-display text-[clamp(36px,5vw,56px)] uppercase leading-[0.9] tracking-[-0.01em]">
          {brand.name}
        </h1>
        <p className="mt-2 font-body text-text-inverse/70">
          Iniciá sesión para gestionar tu cervecería.
        </p>
        <div className="mt-8">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
