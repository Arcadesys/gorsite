import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  
  return resend
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  logPrefix?: string
}

export async function sendEmail({ to, subject, html, from, logPrefix = 'EMAIL TO SEND:' }: EmailOptions) {
  const resendClient = getResendClient()
  
  if (!resendClient) {
    console.log('⚠️  RESEND_API_KEY not found, logging email instead:')
    console.log(logPrefix)
    console.log('---')
    console.log(`From: ${from || 'The Arcade Art Gallery <noreply@artpop.vercel.app>'}`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML Content: ${html}`)
    console.log('---')
    return { success: true, message: 'Email logged (no API key)' }
  }

  try {
    const result = await resendClient.emails.send({
      from: from || 'The Arcade Art Gallery <noreply@artpop.vercel.app>',
      to,
      subject,
      html,
    })

    return { success: true, result }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

export async function sendUploadFailureAlert(params: {
  route: string
  reason: string
  userEmail?: string | null
  userId?: string | null
  fileName?: string
  mime?: string
  size?: number
  status?: number
  reqId?: string
}) {
  const to = (process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me').toString()
  const subject = `Upload failed on ${params.route} (${params.status || 'error'})${params.reqId ? ` [${params.reqId}]` : ''}`
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto; line-height:1.5">
      <h2>🚨 Upload Failure</h2>
      ${params.reqId ? `<p><strong>Request ID:</strong> ${params.reqId}</p>` : ''}
      <p><strong>Route:</strong> ${params.route}</p>
      <p><strong>Reason:</strong> ${params.reason}</p>
      <p><strong>Status:</strong> ${params.status || 'N/A'}</p>
      <p><strong>User:</strong> ${params.userEmail || 'unknown'} (${params.userId || 'n/a'})</p>
      ${params.fileName ? `<p><strong>File:</strong> ${params.fileName}</p>` : ''}
      ${params.mime ? `<p><strong>MIME:</strong> ${params.mime}</p>` : ''}
      ${typeof params.size === 'number' ? `<p><strong>Size:</strong> ${params.size} bytes</p>` : ''}
      <p style="color:#6b7280">This is an automated alert from the upload API.</p>
    </div>
  `
  try {
    await sendEmail({ to, subject, html, logPrefix: '[UPLOAD FAILURE ALERT]' })
  } catch (e) {
    console.error('Failed to send upload failure alert email', e)
  }
}

export function generateInvitationEmailHTML({
  inviteLink,
  customMessage,
  galleryName,
  isResend = false
}: {
  inviteLink: string
  customMessage?: string
  galleryName: string
  isResend?: boolean
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Join ${galleryName}</title>
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
        .custom-message {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
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
        .steps {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps ol {
            margin: 0;
            padding-left: 20px;
        }
        .steps li {
            margin: 8px 0;
            color: #4b5563;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .expiry-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${galleryName}</div>
            <div class="subtitle">Creating spaces for digital artists to thrive</div>
        </div>
        
        <div class="content">
            <h1>🎨 You're Invited to Join Our Gallery!</h1>
            
            <p>Hello!</p>
            
            <p>You've been invited to create your artist profile on <strong>${galleryName}</strong>! ${isResend ? 'This is a resent invitation in case you missed the previous one.' : ''}</p>
            
            ${customMessage ? `
            <div class="custom-message">
                <strong>Personal message:</strong><br>
                ${customMessage}
            </div>
            ` : ''}
            
            <div class="steps">
                <p><strong>Getting started is easy:</strong></p>
                <ol>
                    <li>Click the invitation link below</li>
                    <li>Choose your unique artist URL (your "slug")</li>
                    <li>Create a secure password</li>
                    <li>Set up your first gallery page</li>
                </ol>
            </div>
            
            <div style="text-align: center;">
                <a href="${inviteLink}" class="cta-button">Accept Invitation & Get Started</a>
            </div>
            
            <div class="expiry-notice">
                ⏰ <strong>Important:</strong> This invitation will expire in 7 days. Please accept it soon to secure your spot!
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb; font-family: monospace; background-color: #f3f4f6; padding: 8px; border-radius: 4px;">
                ${inviteLink}
            </p>
        </div>
        
        <div class="footer">
            <p>Welcome to ${galleryName}!</p>
            <p style="margin-top: 8px;">If you have any questions, feel free to reply to this email.</p>
        </div>
    </div>
</body>
</html>
`
}

export function generateSuperuserCopyEmailHTML({
  originalRecipient,
  inviteLink,
  customMessage,
  galleryName,
  isResend = false
}: {
  originalRecipient: string
  inviteLink: string
  customMessage?: string
  galleryName: string
  isResend?: boolean
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[COPY] Artist Invitation ${isResend ? 'Resent' : 'Sent'}</title>
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
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #1f2937;
            color: white;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            gap: 12px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background-color: #f9fafb;
            border-radius: 4px;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .link-box {
            background-color: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
        }
        .link-box a {
            word-break: break-all;
            color: #2563eb;
            text-decoration: none;
        }
        .custom-message-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">[ADMIN COPY] Artist Invitation ${isResend ? 'Resent' : 'Sent'}</h2>
        </div>
        
        <p>Hi there,</p>
        
        <p>This is a copy of the artist invitation that was just ${isResend ? 'resent' : 'sent'} to <strong>${originalRecipient}</strong> for your records.</p>
        
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Recipient:</span>
                <span class="info-value">${originalRecipient}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Gallery:</span>
                <span class="info-value">${galleryName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${isResend ? 'Resent' : 'Sent'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Expires:</span>
                <span class="info-value">7 days from now</span>
            </div>
        </div>
        
        ${customMessage ? `
        <div class="custom-message-box">
            <strong>Personal message included:</strong><br>
            ${customMessage}
        </div>
        ` : '<p><em>No personal message was included.</em></p>'}
        
        <div class="link-box">
            <strong>Invitation Link:</strong><br>
            <a href="${inviteLink}">${inviteLink}</a>
        </div>
        
        <div class="footer">
            <p>${galleryName}<br>Admin Notification System</p>
        </div>
    </div>
</body>
</html>
`
}
