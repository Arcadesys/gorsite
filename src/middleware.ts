
import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect registration page to login since we don't allow registration
  if (pathname === '/admin/register') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Check if the path starts with /admin and is not the login page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {

    // Prepare a response so Supabase can set/refresh auth cookies if needed
    const res = NextResponse.next();
    const supabase = getSupabaseServer(request, res);

    const { data: { session } } = await supabase.auth.getSession();

    // If the user is not authenticated, redirect to the login page
    if (!session) {

      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Optional: Check if the user is an admin using Supabase metadata conventions
    const user = session.user as any;
    const isAdmin = Boolean(
      user?.app_metadata?.roles?.includes?.('admin') ||
      (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
      user?.user_metadata?.is_admin === true
    );

    if (!isAdmin) {
      // If not an admin, redirect to the home page
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Continue with the response that captured any cookie updates
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};