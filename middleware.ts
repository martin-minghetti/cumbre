import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { isSafeRelative } from '@/lib/safe-redirect';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public auth endpoints
  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  // Allow admin login page itself
  if (pathname === '/admin-login') return NextResponse.next();

  const isAdmin = pathname.startsWith('/admin');
  const isPos = pathname.startsWith('/pos');
  if (!isAdmin && !isPos) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin-login';
    if (isSafeRelative(pathname)) {
      url.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (isAdmin && session.role !== 'owner') {
    const url = req.nextUrl.clone();
    url.pathname = '/pos';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*'],
};
