import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUNSET_ENABLED = process.env.NEXT_PUBLIC_SUNSET_MODE === 'true';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (SUNSET_ENABLED && pathname !== '/sunset') {
    const url = request.nextUrl.clone();
    url.pathname = '/sunset';
    return NextResponse.redirect(url);
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
     * - public assets (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)',
  ],
};