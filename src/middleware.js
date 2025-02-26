import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('zebra-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');
  const isPublicPath = [
    '/auth/login',
    '/auth/register',
  ].includes(request.nextUrl.pathname);

  // If we have a token and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If we don't have a token and trying to access protected pages, redirect to login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
