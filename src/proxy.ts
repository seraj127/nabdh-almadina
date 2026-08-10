import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Next.js Proxy for route protection.
 * - Protects /api/admin/* routes with JWT verification
 * - Adds session info to request headers for downstream use
 * - Allows public routes to pass through
 * - When Supabase is configured, refreshes auth sessions
 *
 * NOTE: Proxy runs on Node.js runtime (not Edge), so full DB access is available.
 * Currently uses verifyToken() (JWT-only) for performance.
 * Full session validation (including DB revocation check) happens in API route handlers.
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/google',
  '/api/products',
  '/api/categories',
  '/api/delivery-zones',
  '/api/admin/coupons/validate',
  '/api/admin/seed-categories',
  '/api/admin/seed-subcategories',
  '/api/supabase/health',
  '/api/supabase/test-connection',
];

// Routes that require admin authentication
const ADMIN_ROUTES = ['/api/admin'];

// Routes that require any authenticated user
const PROTECTED_ROUTES = [
  '/api/addresses',
  '/api/orders',
  '/api/cart',
  '/api/wallet',
  '/api/loyalty',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route =>
    pathname.startsWith(route)
  ) && !pathname.includes('/coupons/validate'); // Allow coupon validation publicly
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ── Supabase session refresh (when configured) ──────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      let supabaseResponse = NextResponse.next({ request });

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      // Refresh the session (no need to await the result for pass-through routes)
      await supabase.auth.getUser();

      // For admin routes, also check Supabase auth
      if (isAdminRoute(pathname)) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Fall through to JWT check below — Supabase auth is supplementary
        }
      }

      // Continue with normal auth flow
    } catch {
      // Supabase session refresh failed — continue with JWT auth
    }
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only check auth for admin or protected routes
  if (!isAdminRoute(pathname) && !isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Extract session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value ||
                       request.cookies.get('admin_session')?.value;

  // Also check Authorization header
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const token = sessionToken || bearerToken;

  if (!token) {
    // For admin routes, strict auth required
    if (isAdminRoute(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized – authentication required' },
        { status: 401 }
      );
    }
    // For protected routes, allow but mark as unauthenticated
    // (individual handlers can check and decide)
    return NextResponse.next();
  }

  // Verify the JWT token
  const payload = await verifyToken(token);

  if (!payload) {
    if (isAdminRoute(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized – invalid or expired session. Please log in again.' },
        { status: 401 }
      );
    }
    // For protected routes, pass through - handler will handle
    return NextResponse.next();
  }

  // For admin routes, verify admin role
  if (isAdminRoute(pathname) && payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden – admin access required' },
      { status: 403 }
    );
  }

  // Add session info to request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-user-id', payload.userId);
  requestHeaders.set('x-session-role', payload.role);
  requestHeaders.set('x-session-platform', payload.platform);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
