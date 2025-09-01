import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { ensureLocalUser } from '@/lib/auth-helpers'
import { baseFromEmail, isReservedSlug } from '@/lib/slug-utils'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  
  if (code) {
    const response = new NextResponse()
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

      // Check if this is a password recovery type
      if (type === 'recovery') {
        // Redirect to password reset page with the access and refresh tokens
        const { data: session } = await supabase.auth.getSession()
        if (session?.session) {
          const resetUrl = new URL('/auth/reset-password', requestUrl.origin)
          resetUrl.searchParams.set('access_token', session.session.access_token)
          resetUrl.searchParams.set('refresh_token', session.session.refresh_token)
          return NextResponse.redirect(resetUrl)
        }
      }

      // For other auth types, redirect based on role
      const { data: { user } } = await supabase.auth.getUser()

      // Ensure local User row and auto-create portfolio if missing
      if (user) {
        // Keep Prisma User in sync with Supabase
        await ensureLocalUser(user as any)

        // Create a portfolio if the user doesn't have one yet
        const hasPortfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
        if (!hasPortfolio) {
          // Derive base slug from email local-part, enforce reserved list
          let base = baseFromEmail(user.email)

          // Ensure slug uniqueness globally across portfolios
          let slug = base
          let i = 1
          while (isReservedSlug(slug) || await prisma.portfolio.findUnique({ where: { slug } })) {
            slug = `${base}-${i++}`
          }

          const displayName =
            (user.user_metadata as any)?.display_name ||
            (user.user_metadata as any)?.full_name ||
            String(user.email || '').split('@')[0] ||
            'Artist'

          await prisma.portfolio.create({
            data: {
              slug,
              displayName,
              description: `Welcome to ${displayName}'s art gallery!`,
              userId: user.id,
              accentColor: 'green',
              colorMode: 'dark',
            },
          })

          // Ensure hidden commissions gallery exists for user
          const baseSlug = 'commissions'
          const existing = await prisma.gallery.findFirst({ where: { userId: user.id, slug: baseSlug } })
          if (!existing) {
            await prisma.gallery.create({
              data: {
                userId: user.id,
                name: 'Commissions',
                description: 'Commission examples and price points',
                isPublic: false,
                slug: baseSlug,
              },
            })
          }
        }
      }
      const isAdmin = Boolean(
        (user as any)?.app_metadata?.roles?.includes?.('admin') ||
        (typeof (user as any)?.user_metadata?.role === 'string' && (user as any).user_metadata.role.toLowerCase() === 'admin') ||
        (user as any)?.user_metadata?.is_admin === true
      )
      const metaDone = Boolean((user as any)?.user_metadata?.onboarding?.done)
      const dest = isAdmin ? '/admin/dashboard' : (metaDone ? '/studio' : '/studio/onboarding')
      return NextResponse.redirect(new URL(dest, requestUrl.origin))
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/admin/login?error=auth_exception', requestUrl.origin))
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/admin/login?error=no_code', requestUrl.origin))
}
