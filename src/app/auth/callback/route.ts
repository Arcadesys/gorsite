import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  
  if (code) {
    const response = NextResponse.next()
    const supabase = getSupabaseServer(request as any, response as any)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/admin/login?error=auth_failed', requestUrl.origin))
      }

      // Check if this is an invitation type
      if (type === 'invite') {
        // Redirect to password setup page for invited users
        return NextResponse.redirect(new URL('/auth/set-password', requestUrl.origin))
      }

      // For other auth types, redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/admin/login?error=auth_exception', requestUrl.origin))
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/admin/login?error=no_code', requestUrl.origin))
}