import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { isSafeRelative } from '@/lib/safe-redirect';

const CASHIER_ALLOWED_PREFIXES = ['/admin/pos', '/admin/caja'];

function cashierMayAccess(pathname: string): boolean {
  return CASHIER_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  if (pathname === '/admin-login') return NextResponse.next();

  const isAdmin = pathname.startsWith('/admin');
  if (!isAdmin) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin-login';
    if (isSafeRelative(pathname)) url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (session.role === 'owner') return NextResponse.next();

  if (session.role === 'cashier' && cashierMayAccess(pathname)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin/pos';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
