import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // We only want to protect /admin routes
    if (pathname.startsWith('/admin')) {
        const adminSession = request.cookies.get('admin_session')?.value;

        if (!adminSession) {
            // Redirect to login if the cookie is missing
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Add security headers to all responses
    const response = NextResponse.next();

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    // Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Enforce HTTPS
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
