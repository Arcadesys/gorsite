import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isReservedSlug } from '@/lib/slug-utils'
import { ensureLocalUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// POST /api/signup/complete - Complete the artist signup process
export async function POST(req: NextRequest) {
  const { token, slug, displayName, password } = await req.json().catch(() => ({}))

  if (!token || !slug || !displayName || !password) {
    return NextResponse.json({ 
      error: 'Missing required fields' 
    }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ 
      error: 'Password must be at least 8 characters' 
    }, { status: 400 })
  }

  try {
    if (isReservedSlug(slug)) {
      return NextResponse.json({ error: 'Artist URL is reserved' }, { status: 400 })
    }
    // Validate the invitation
    const invitation = await prisma.artistInvitation.findUnique({
      where: { token }
    })

    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Invalid or expired invitation' 
      }, { status: 400 })
    }

    // Check if slug is still available
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { slug }
    })

    if (existingPortfolio) {
      return NextResponse.json({ 
        error: 'Artist URL is no longer available' 
      }, { status: 400 })
    }

    // Create the user in Supabase Auth
    const admin = getSupabaseAdmin()
    const { data: authData, error: authError } = await (admin as any).auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: { 
        role: 'ARTIST',
        display_name: displayName,
        portfolio_slug: slug
      },
      app_metadata: { 
        roles: ['artist'] 
      }
    })

    if (authError || !authData?.user) {
      console.error('Supabase user creation error:', authError)
      return NextResponse.json({ 
        error: 'Failed to create user account' 
      }, { status: 500 })
    }

    const userId = authData.user.id

    // Create local user record
    await ensureLocalUser({
      id: userId,
      email: invitation.email,
      user_metadata: {
        display_name: displayName,
        role: 'ARTIST'
      }
    } as any)

    // Create the portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        slug,
        displayName,
        description: `Welcome to ${displayName}'s art gallery!`,
        userId,
        accentColor: 'green', // Default accent color
        colorMode: 'dark'     // Default color mode
      }
    })

    // Ensure hidden commissions gallery exists for user
    const baseSlug = 'commissions'
    const existing = await prisma.gallery.findFirst({ where: { userId, slug: baseSlug } })
    if (!existing) {
      await prisma.gallery.create({
        data: {
          userId,
          name: 'Commissions',
          description: 'Commission examples and price points',
          isPublic: false,
          slug: baseSlug,
        },
      })
    }

    // Mark invitation as accepted
    await prisma.artistInvitation.update({
      where: { id: invitation.id },
      data: { 
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      portfolioId: portfolio.id,
      slug,
      userId,
      message: 'Account created successfully!'
    })

  } catch (error: any) {
    console.error('Signup completion error:', error)
    return NextResponse.json({ 
      error: 'Failed to complete signup' 
    }, { status: 500 })
  }
}
