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
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🔧 [${requestId}] Signup completion request received at ${new Date().toISOString()}`);
  console.log(`🔧 [${requestId}] Request URL:`, req.url);
  console.log(`🔧 [${requestId}] Environment check:`, {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
  
  let requestData;
  try {
    const rawBody = await req.text();
    console.log(`📋 [${requestId}] Raw request body length:`, rawBody.length);
    console.log(`📋 [${requestId}] Raw request body preview:`, rawBody.substring(0, 100) + '...');
    
    requestData = JSON.parse(rawBody);
    console.log(`📋 [${requestId}] Request data structure:`, {
      hasToken: !!requestData.token,
      tokenLength: requestData.token?.length || 0,
      hasEmail: !!requestData.email,
      email: requestData.email,
      hasSlug: !!requestData.slug,
      slug: requestData.slug,
      hasDisplayName: !!requestData.displayName,
      displayName: requestData.displayName,
      hasPassword: !!requestData.password,
      passwordLength: requestData.password?.length || 0
    });
  } catch (jsonError) {
    console.error(`❌ [${requestId}] JSON parsing failed:`, {
      error: jsonError instanceof Error ? jsonError.message : String(jsonError),
      requestId
    });
    return NextResponse.json({ 
      error: 'Invalid request format',
      errorCode: 'INVALID_JSON',
      requestId
    }, { status: 400 });
  }

  const { token, email, slug, displayName, password } = requestData;

  if (!token || !email || !slug || !displayName || !password) {
    const missingFields = {
      hasToken: !!token,
      hasEmail: !!email, 
      hasSlug: !!slug,
      hasDisplayName: !!displayName,
      hasPassword: !!password
    };
    console.log(`❌ [${requestId}] Missing required fields:`, missingFields);
    return NextResponse.json({ 
      error: 'Missing required fields',
      errorCode: 'MISSING_FIELDS',
      missingFields,
      requestId
    }, { status: 400 });
  }

  // Use the shared password validation
  let passwordError;
  try {
    console.log(`🔐 [${requestId}] Validating password (length: ${password.length})`);
    passwordError = validatePassword(password);
    if (passwordError) {
      console.log(`❌ [${requestId}] Password validation failed:`, {
        error: passwordError,
        passwordLength: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password)
      });
      return NextResponse.json({ 
        error: passwordError,
        errorCode: 'INVALID_PASSWORD',
        passwordAnalysis: {
          length: password.length,
          hasUppercase: /[A-Z]/.test(password),
          hasLowercase: /[a-z]/.test(password),
          hasNumber: /\d/.test(password)
        },
        requestId
      }, { status: 400 });
    }
    console.log(`✅ [${requestId}] Password validation passed`);
  } catch (validationError) {
    console.error(`❌ [${requestId}] Password validation function error:`, {
      error: validationError instanceof Error ? validationError.message : String(validationError),
      requestId
    });
    // Fallback validation
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters',
        errorCode: 'PASSWORD_TOO_SHORT',
        passwordLength: password.length,
        requestId
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
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase credentials' 
      }, { status: 500 });
    }
    
    let admin;
    try {
      admin = getSupabaseAdmin();
      console.log('✅ Supabase admin client initialized');
    } catch (adminError) {
      console.error('❌ Failed to initialize Supabase admin:', adminError);
      return NextResponse.json({ 
        error: 'Server configuration error: Failed to initialize Supabase admin' 
      }, { status: 500 });
    }

    // Note: We'll let Supabase handle duplicate email detection during user creation
    // This is more reliable than trying to check beforehand
    console.log(`📧 [${requestId}] Proceeding to user creation (duplicate emails will be caught by Supabase)`);

    console.log(`✅ [${requestId}] Ready for user creation`);

    // Create the user in Supabase Auth
    console.log(`👤 [${requestId}] Creating Supabase user...`);
    
    const userCreatePayload = {
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
    };
    
    console.log(`👤 [${requestId}] User creation payload:`, {
      email: userCreatePayload.email,
      hasPassword: !!userCreatePayload.password,
      passwordLength: userCreatePayload.password.length,
      email_confirm: userCreatePayload.email_confirm,
      user_metadata: userCreatePayload.user_metadata,
      app_metadata: userCreatePayload.app_metadata
    });
    
    const { data: authData, error: authError } = await (admin as any).auth.admin.createUser(userCreatePayload);

    if (authError || !authData?.user) {
      console.error(`❌ [${requestId}] Supabase user creation error:`, {
        error: authError?.message || 'Unknown error',
        status: authError?.status,
        code: authError?.code,
        details: authError?.details,
        hint: authError?.hint,
        hasData: !!authData,
        hasUser: !!authData?.user,
        fullAuthError: authError,
        requestId
      });
      
      // Check if this is a duplicate email error
      const isDuplicateEmail = authError?.message?.toLowerCase().includes('user already registered') ||
                              authError?.message?.toLowerCase().includes('email already exists') ||
                              authError?.message?.toLowerCase().includes('already in use') ||
                              authError?.code === 'user_already_exists';
      
      if (isDuplicateEmail) {
        return NextResponse.json({ 
          error: 'An account with this email already exists',
          errorCode: 'EMAIL_ALREADY_EXISTS',
          email,
          requestId
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create user account: ' + (authError?.message || 'Unknown error'),
        errorCode: 'SUPABASE_USER_CREATION_FAILED',
        supabaseError: {
          message: authError?.message,
          status: authError?.status,
          code: authError?.code,
          details: authError?.details,
          hint: authError?.hint
        },
        requestId
      }, { status: 500 });
    }

    console.log(`✅ [${requestId}] Supabase user created:`, {
      userId: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      role: authData.user.role,
      createdAt: authData.user.created_at,
      userMetadata: authData.user.user_metadata,
      appMetadata: authData.user.app_metadata
    });

    const userId = authData.user.id;

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

    const completionTime = Date.now() - startTime;
    console.log(`🎉 [${requestId}] Signup completed successfully in ${completionTime}ms!`);
    
    return NextResponse.json({
      success: true,
      portfolioId: portfolio.id,
      slug,
      userId,
      message: 'Account created successfully!',
      requestId,
      processingTime: completionTime
    });

  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Signup completion error after ${errorTime}ms:`, {
      error: error.message || String(error),
      stack: error.stack,
      name: error.name,
      requestId
    });
    return NextResponse.json({ 
      error: 'Failed to complete signup',
      errorCode: 'SIGNUP_COMPLETION_FAILED',
      errorDetails: error.message || String(error),
      requestId,
      processingTime: errorTime
    }, { status: 500 });
  }
}
