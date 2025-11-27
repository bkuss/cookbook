import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secretKey);
}

const publicPaths = ['/login', '/api/auth/login', '/api/auth/setup', '/api/auth/status'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get('session')?.value;

  if (!token) {
    // Redirect to login for pages, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Invalid token - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sitzung abgelaufen' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately to avoid body consumption issues)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
