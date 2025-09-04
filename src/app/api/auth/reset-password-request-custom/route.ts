import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getBaseUrl } from '@/lib/base-url'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/auth/reset-password-request-custom - Request password reset email via Resend
export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    
    // Check if user exists
    const { data: users, error: userError } = await admin.auth.admin.listUsers()
    if (userError) {
      console.error('Error listing users:', userError)
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        ok: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        ok: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store the reset token in the user's metadata
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString()
      }
    })

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return NextResponse.json({ 
        ok: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Create reset link
    const resetUrl = `${getBaseUrl()}/auth/reset-password-custom?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset Your Password - The Arcade Art Gallery',
      html: generatePasswordResetEmailHTML({
        resetUrl,
        email,
        expiresAt: expiresAt.toISOString()
      }),
      logPrefix: 'PASSWORD RESET EMAIL:'
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Still return success to not reveal if email exists
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  } catch (error: any) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  }
}

function generatePasswordResetEmailHTML({
  resetUrl,
  email,
  expiresAt
}: {
  resetUrl: string
  email: string
  expiresAt: string
}) {
  const expiryDate = new Date(expiresAt)
  const timeString = expiryDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .content h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .security-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .expiry-notice {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .link-box {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">The Arcade Art Gallery</div>
            <div class="subtitle">Secure password reset</div>
        </div>
        
        <div class="content">
            <h1>🔐 Reset Your Password</h1>
            
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your account: <strong>${email}</strong></p>
            
            <p>If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">Reset My Password</a>
            </div>
            
            <div class="expiry-notice">
                ⏰ <strong>This link expires at ${timeString} today.</strong> You have 1 hour to use this link.
            </div>
            
            <div class="security-notice">
                🛡️ <strong>Security Note:</strong> If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <div class="link-box">
                ${resetUrl}
            </div>
            
            <p><strong>For your security:</strong></p>
            <ul>
                <li>This link can only be used once</li>
                <li>It will expire in 1 hour</li>
                <li>Never share this link with anyone</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>The Arcade Art Gallery</p>
            <p style="margin-top: 8px;">If you need help, reply to this email or contact our support team.</p>
        </div>
    </div>
</body>
</html>
`
}