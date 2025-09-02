import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isReservedSlug } from '@/lib/slug-utils'
import { ensureLocalUser } from '@/lib/auth-helpers'
import { validatePassword } from '@/lib/password-validation'

export const dynamic = 'force-dynamic'

// POST /api/signup/complete - Complete the artist signup process
export async function POST(req: NextRequest) {
  const { token, email, slug, displayName, password } = await req.json().catch(() => ({}))

  if (!token || !email || !slug || !displayName || !password) {
    return NextResponse.json({ 
      error: 'Missing required fields' 
    }, { status: 400 })
  }

  // Use the shared password validation
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ 
      error: passwordError 
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

    // Check if email is already in use
    const admin = getSupabaseAdmin()
    const { data: existingUser } = await (admin as any).auth.admin.getUserByEmail(email)
    
    if (existingUser?.user) {
      return NextResponse.json({ 
        error: 'An account with this email already exists' 
      }, { status: 400 })
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await (admin as any).auth.admin.createUser({
      email: email,
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
      email: email,
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

    // Mark invitation as accepted and update with the email used
    await prisma.artistInvitation.update({
      where: { id: invitation.id },
      data: { 
        email: email, // Update with the actual email used
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
