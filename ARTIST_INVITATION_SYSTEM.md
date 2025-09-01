# Custom Artist Invitation System

## Overview

This system provides a branded email invitation experience for The Arcade Art Gallery, allowing superadmins to invite artists with a custom, professional email flow.

## How It Works

### 1. Superadmin Sends Invitation

- Navigate to `/admin/system`
- Enter artist's email address
- Select "ARTIST (Custom branded email)" role
- Optionally add a personal message
- Click "Send Invite"

### 2. Artist Receives Branded Email

The artist receives an email from "The Arcade Art Gallery" that includes:
- Professional branding and messaging
- Personal message from the superadmin (if provided)
- Secure invitation link that expires in 7 days
- Clear instructions for the signup process

### 3. Artist Completes Signup

When the artist clicks the invitation link, they are taken to `/signup?token=...` where they:

1. **Choose their artist URL** (slug)
   - Real-time availability checking
   - Format validation (lowercase, numbers, hyphens only)
   - Minimum 3 characters required
   - Example: `john-artist` → `thearcades.me/john-artist`

2. **Create their profile**
   - Enter their display name
   - Create a secure password (minimum 8 characters)
   - Password confirmation

3. **Automatic setup**
   - Supabase auth account created
   - Local user record synchronized
   - Portfolio created with their chosen slug
   - Invitation marked as accepted
   - Redirected to `/studio/onboarding`

## Database Schema

### ArtistInvitation Model

```sql
CREATE TABLE "ArtistInvitation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" "ArtistInvitationStatus" NOT NULL DEFAULT 'PENDING',
  "customMessage" TEXT,
  "invitedBy" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ArtistInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArtistInvitation_token_key" ON "ArtistInvitation"("token");
```

### Status Values

- `PENDING`: Invitation sent, awaiting acceptance
- `ACCEPTED`: Artist has completed signup
- `EXPIRED`: Invitation has expired (7 days)
- `REVOKED`: Manually cancelled by superadmin

## API Endpoints

### POST /api/admin/invite-artist
- **Auth**: Superadmin only
- **Purpose**: Send custom branded invitation
- **Body**: `{ email: string, inviteMessage?: string }`
- **Response**: `{ ok: true, invitationId: string }`

### GET /api/signup/validate-invitation?token=...
- **Auth**: Public
- **Purpose**: Validate invitation token and get details
- **Response**: `{ invitation: { id, email, customMessage, ... } }`

### GET /api/signup/check-slug?slug=...
- **Auth**: Public
- **Purpose**: Check if portfolio slug is available
- **Response**: `{ available: boolean, slug: string }`

### POST /api/signup/complete
- **Auth**: Public (token-based)
- **Purpose**: Complete artist signup process
- **Body**: `{ token: string, slug: string, displayName: string, password: string }`
- **Response**: `{ success: true, portfolioId: string, slug: string }`

## Email Integration

### Current Implementation
- Logs email content to console (development)
- Shows email preview in terminal output
- Ready for email service integration

### Email Service Integration

To integrate with a real email service (SendGrid, Mailgun, etc.), update the `sendArtistInvitationEmail` function in `/api/admin/invite-artist/route.ts`:

```typescript
// Example with SendGrid
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: email,
  from: { email: 'noreply@thearcades.me', name: 'The Arcade Art Gallery' },
  subject: `You're Invited to Join The Arcade Art Gallery`,
  html: generateHTMLEmailTemplate({ inviteLink, customMessage, galleryName })
})
```

### Environment Variables

Add to your `.env` file:
```bash
# Email service (example for SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Gallery branding
GALLERY_NAME="The Arcade Art Gallery"
GALLERY_EMAIL="noreply@thearcades.me"
```

## Security Features

1. **Secure tokens**: 32-byte random tokens for invitations
2. **Expiration**: Invitations expire after 7 days
3. **Single use**: Tokens are marked as accepted and cannot be reused
4. **Slug validation**: Prevents conflicts and ensures URL safety
5. **Superadmin only**: Only superadmins can send invitations

## User Experience Flow

```
Superadmin enters email → Custom branded email sent → Artist clicks link → 
Choose URL slug → Create password → Account created → Portfolio ready → 
Guided to setup first gallery
```

## Testing the System

1. **Send an invitation**:
   - Go to `/admin/system`
   - Enter a test email
   - Select "ARTIST" role
   - Add a personal message
   - Check console for email output

2. **Test signup flow**:
   - Copy the invitation link from console
   - Open in new browser/incognito
   - Complete the signup process
   - Verify portfolio creation

3. **Verify database**:
   - Check `ArtistInvitation` table for invitation record
   - Check `Portfolio` table for new portfolio
   - Check `User` table for new user account

## Future Enhancements

1. **Email templates**: HTML email templates with gallery branding
2. **Invitation management**: Admin UI to view/revoke pending invitations
3. **Bulk invitations**: Send multiple invitations at once
4. **Custom domains**: Support for custom domain URLs
5. **Analytics**: Track invitation open rates and conversion
6. **Reminder emails**: Send follow-up emails for pending invitations