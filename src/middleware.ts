import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect registration page to login since we don't allow registration
  if (pathname === '/admin/register') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Check if the path starts with /admin and is not the login page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // If the user is not authenticated, redirect to the login page
    if (!token) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Check if the user is an admin
    if (token.role !== 'ADMIN') {
      // If not an admin, redirect to the home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 