
import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Explicitly skip API routes to avoid NextResponse.next() in app route handlers
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Redirect registration page to login since we don't allow registration
  if (pathname === '/admin/register') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Check if the path starts with /admin and is not the login page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {

    // Prepare a response so Supabase can set/refresh auth cookies if needed
    const res = NextResponse.next();
    const supabase = getSupabaseServer(request, res);

    const { data: { user } } = await supabase.auth.getUser();

    // If the user is not authenticated, redirect to the login page
    if (!user) {

      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Check if password change is required
    const authUser = user as any;
    const requiresPasswordChange = Boolean(authUser?.user_metadata?.force_password_change);
    
    if (requiresPasswordChange && pathname !== '/auth/change-password') {
      return NextResponse.redirect(new URL('/auth/change-password', request.url));
    }

    // Optional: Check if the user is an admin using Supabase metadata conventions
    const isAdmin = Boolean(
      authUser?.app_metadata?.roles?.includes?.('admin') ||
      (typeof authUser?.user_metadata?.role === 'string' && authUser.user_metadata.role.toLowerCase() === 'admin') ||
      authUser?.user_metadata?.is_admin === true
    );

    if (!isAdmin) {
      // If not an admin, redirect to the home page
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is a superadmin and is visiting the base /admin path,
    // redirect them to the system management page. Otherwise send admins to dashboard.
    const superEmail = (process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me').toLowerCase();
    const isSuperAdmin = isAdmin && (String(authUser?.email || '').toLowerCase() === superEmail);

    if (pathname === '/admin' || pathname === '/admin/') {
      const target = isSuperAdmin ? '/admin/system' : '/admin/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Continue with the response that captured any cookie updates
    return res;
  }

  // Artist Studio area: requires authenticated user; allows admins and artists
  if (pathname.startsWith('/studio')) {
    const res = NextResponse.next();
    const supabase = getSupabaseServer(request, res);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Check if password change is required
    const authUser = user as any;
    const requiresPasswordChange = Boolean(authUser?.user_metadata?.force_password_change);
    
    if (requiresPasswordChange && pathname !== '/auth/change-password') {
      return NextResponse.redirect(new URL('/auth/change-password', request.url));
    }
    
    // No role gate beyond being logged in; artists and admins both allowed
    return res;
  }

  // Allow access to change password page for authenticated users
  if (pathname === '/auth/change-password') {
    const res = NextResponse.next();
    const supabase = getSupabaseServer(request, res);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/studio/:path*',
    '/auth/change-password'
  ],
};
