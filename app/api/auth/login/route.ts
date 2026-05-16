import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword, signSession } from '@/lib/auth';
import { isSafeRelative } from '@/lib/safe-redirect';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  let email: string | undefined;
  let password: string | undefined;
  let redirectTo = '/admin';

  if (isForm) {
    const fd = await req.formData();
    email = String(fd.get('email') ?? '');
    password = String(fd.get('password') ?? '');
    const r = String(fd.get('redirect') ?? '');
    if (r && isSafeRelative(r)) redirectTo = r;
  } else {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    email = parsed.data.email;
    password = parsed.data.password;
  }

  if (!email || !password) {
    if (isForm) {
      const url = new URL('/admin-login', req.url);
      url.searchParams.set('error', '1');
      url.searchParams.set('redirect', redirectTo);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.active) {
    if (isForm) {
      const url = new URL('/admin-login', req.url);
      url.searchParams.set('error', '1');
      url.searchParams.set('redirect', redirectTo);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    if (isForm) {
      const url = new URL('/admin-login', req.url);
      url.searchParams.set('error', '1');
      url.searchParams.set('redirect', redirectTo);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signSession({ userId: user.id, role: user.role });
  const setCookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 14 * 24 * 60 * 60,
  };

  if (isForm) {
    const res = NextResponse.redirect(new URL(redirectTo, req.url), 303);
    res.cookies.set('session', token, setCookieOpts);
    return res;
  }
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set('session', token, setCookieOpts);
  return res;
}
