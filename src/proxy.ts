import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/auth-server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValidAdmin = sessionCookie ? verifyAdminSessionToken(sessionCookie) !== null : false;

    // If on /admin/login and already authenticated as admin, go straight to dashboard
    if (pathname === '/admin/login') {
      if (isValidAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // For all protected admin routes (/admin, /admin/dashboard, /admin/approvals, /admin/reports)
    if (!isValidAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
