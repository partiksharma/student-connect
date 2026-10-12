import { NextResponse } from 'next/server';
import { getAdminSessionUser, verifyAdminRequest } from '@/lib/auth-server';

export async function GET(req: Request) {
  const isAuthorized = verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { authenticated: false, error: 'Unauthorized: Valid admin session required' },
      { status: 401 }
    );
  }

  const user = getAdminSessionUser(req);
  return NextResponse.json({
    authenticated: true,
    user,
  });
}
