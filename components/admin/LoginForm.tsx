'use client';
import { useState, useTransition } from 'react';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error === 'Invalid credentials' ? 'Email o contraseña incorrectos.' : 'No pudimos iniciar sesión.');
        return;
      }
      // redirectTo was already validated by the server (isSafeRelative).
      // Use a hard navigation since the Next 16 typed router won't accept arbitrary string as Route.
      window.location.href = redirectTo;
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 block w-full border border-line bg-transparent px-3 py-2 font-body text-text-inverse focus:border-accent focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Contraseña</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 block w-full border border-line bg-transparent px-3 py-2 font-body text-text-inverse focus:border-accent focus:outline-none"
        />
      </label>
      {error && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="block w-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-bg transition hover:bg-paper disabled:opacity-50"
      >
        {pending ? 'procesando…' : 'entrar'}
      </button>
    </form>
  );
}
