import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isReservedSlug } from '@/lib/slug-utils'
import { ensureLocalUser } from '@/lib/auth-helpers'

// Import with fallback
let validatePassword: (password: string) => string | null;
try {
  ({ validatePassword } = require('@/lib/password-validation'));
} catch (importError) {
  console.warn('⚠️ Password validation import failed, using fallback:', importError);
  // Fallback validation function
  validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };
}

export const dynamic = 'force-dynamic'

// POST /api/signup/complete - Complete the artist signup process
export async function POST(req: NextRequest) {
  console.log('🔧 Signup completion request received');
  
  let requestData;
  try {
    requestData = await req.json();
    console.log('📋 Request data keys:', Object.keys(requestData));
  } catch (jsonError) {
    console.error('❌ JSON parsing error:', jsonError);
    return NextResponse.json({ 
      error: 'Invalid request format' 
    }, { status: 400 });
  }

  const { token, email, slug, displayName, password } = requestData;

  if (!token || !email || !slug || !displayName || !password) {
    console.log('❌ Missing required fields:', { 
      hasToken: !!token, 
      hasEmail: !!email, 
      hasSlug: !!slug, 
      hasDisplayName: !!displayName, 
      hasPassword: !!password 
    });
    return NextResponse.json({ 
      error: 'Missing required fields' 
    }, { status: 400 });
  }

  // Use the shared password validation
  let passwordError;
  try {
    passwordError = validatePassword(password);
    if (passwordError) {
      console.log('❌ Password validation failed:', passwordError);
      return NextResponse.json({ 
        error: passwordError 
      }, { status: 400 });
    }
    console.log('✅ Password validation passed');
  } catch (validationError) {
    console.error('❌ Password validation function error:', validationError);
    // Fallback validation
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }
  }

  try {
    if (isReservedSlug(slug)) {
      console.log('❌ Reserved slug attempted:', slug);
      return NextResponse.json({ error: 'Artist URL is reserved' }, { status: 400 })
    }
    
    console.log('🎫 Validating invitation token...');
    // Validate the invitation
    const invitation = await prisma.artistInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      console.log('❌ Invitation not found for token');
      return NextResponse.json({ 
        error: 'Invalid invitation token' 
      }, { status: 400 });
    }

    if (invitation.status !== 'PENDING') {
      console.log('❌ Invitation not pending:', invitation.status);
      return NextResponse.json({ 
        error: 'Invitation already used or invalid' 
      }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      console.log('❌ Invitation expired:', invitation.expiresAt);
      return NextResponse.json({ 
        error: 'Invitation has expired' 
      }, { status: 400 });
    }

    console.log('✅ Invitation validation passed');

    // Check if slug is still available
    console.log('🔍 Checking slug availability:', slug);
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { slug }
    })

    if (existingPortfolio) {
      console.log('❌ Slug already taken:', slug);
      return NextResponse.json({ 
        error: 'Artist URL is no longer available' 
      }, { status: 400 })
    }

    console.log('✅ Slug is available');

    // Check if email is already in use
    console.log('📧 Checking email availability:', email);
    const admin = getSupabaseAdmin()
    const { data: existingUser, error: emailCheckError } = await (admin as any).auth.admin.getUserByEmail(email)
    
    if (emailCheckError) {
      console.log('⚠️ Email check error (may be normal):', emailCheckError.message);
    }
    
    if (existingUser?.user) {
      console.log('❌ Email already exists:', email);
      return NextResponse.json({ 
        error: 'An account with this email already exists' 
      }, { status: 400 })
    }

    console.log('✅ Email is available');

    // Create the user in Supabase Auth
    console.log('👤 Creating Supabase user...');
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
      console.error('❌ Supabase user creation error:', authError)
      return NextResponse.json({ 
        error: 'Failed to create user account: ' + (authError?.message || 'Unknown error')
      }, { status: 500 })
    }

    console.log('✅ Supabase user created:', authData.user.id);

    const userId = authData.user.id

    // Create local user record
    console.log('🏠 Creating local user record...');
    await ensureLocalUser({
      id: userId,
      email: email,
      user_metadata: {
        display_name: displayName,
        role: 'ARTIST'
      }
    } as any)

    console.log('✅ Local user record created');

    // Create the portfolio
    console.log('🎨 Creating portfolio...');
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

    console.log('✅ Portfolio created:', portfolio.id);

    // Ensure hidden commissions gallery exists for user
    console.log('📁 Creating commissions gallery...');
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
      console.log('✅ Commissions gallery created');
    } else {
      console.log('ℹ️ Commissions gallery already exists');
    }

    // Mark invitation as accepted and update with the email used
    console.log('✅ Marking invitation as accepted...');
    await prisma.artistInvitation.update({
      where: { id: invitation.id },
      data: { 
        email: email, // Update with the actual email used
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    console.log('🎉 Signup completed successfully!');
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
