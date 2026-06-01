import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Auth + route-protection middleware.
 *
 * - Refreshes the Supabase session cookie on every request.
 * - Redirects unauthenticated users away from app routes to /auth/login.
 * - Forces unverified users to /auth/verify-email.
 * - Bounces already-authenticated users away from /auth/*.
 *
 * The authoritative onboarding gate lives in (app)/layout.tsx via
 * requireTrainer(), which redirects to /onboarding when incomplete.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/auth');
  const isPublic =
    pathname === '/' || isAuthRoute || pathname.startsWith('/checkin');

  if (!user) {
    if (isPublic) return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const emailVerified = Boolean(user.email_confirmed_at);

  // Signed in but unverified: keep them on the verify page.
  if (!emailVerified && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/verify-email';
    return NextResponse.redirect(url);
  }

  // Signed in & verified but sitting on an auth screen: send to the app.
  if (emailVerified && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
