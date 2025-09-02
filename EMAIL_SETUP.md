# Email Setup Guide

## Overview

Your application now has full email functionality integrated using [Resend](https://resend.com), a modern email service built for developers. All invitation emails will be sent automatically when you invite artists or users.

## Quick Setup (5 minutes)

### 1. Create a Resend Account
- Go to [resend.com](https://resend.com)
- Sign up for a free account (100 emails/day free tier)
- Verify your email address

### 2. Get Your API Key
- Navigate to [API Keys](https://resend.com/api-keys) in your Resend dashboard
- Click "Create API Key" 
- Name it something like "Gorsite Production" or "Art Gallery"
- Copy the API key (starts with `re_`)

### 3. Add to Environment Variables
Add this to your `.env.local` file:
```bash
RESEND_API_KEY=re_your_api_key_here
```

### 4. Set Up Your Domain (Optional but Recommended)
For production, you should send emails from your own domain:

1. Go to [Domains](https://resend.com/domains) in Resend
2. Add your domain (e.g., `artpop.vercel.app`)
3. Add the DNS records to your domain provider
4. Update the `from` field in `/src/lib/email.ts` to use your domain

## Features

### ✅ What's Now Working
- **Artist Invitations** - Beautiful HTML emails with your gallery branding
- **Admin Notifications** - You get copies of all invitations sent
- **Resend Support** - Handles failed deliveries gracefully
- **Responsive Design** - Emails look great on mobile and desktop
- **Professional Styling** - Modern, branded email templates
- **Graceful Fallback** - Logs emails to console if no API key is set

### 📧 Email Types
1. **Artist Invitation** - Sent to new artists with signup link
2. **Admin Copy** - Sent to superadmin for record keeping
3. **Resend Invitation** - For failed or expired invitations

### 🎨 Email Templates
The emails include:
- Gallery branding and logo
- Personal messages from admin
- Clear call-to-action buttons
- Step-by-step onboarding instructions
- Professional styling with your brand colors
- Mobile-responsive design

## Testing

### Development Testing
Without an API key, emails will be logged to your console for testing.

### Production Testing
1. Set your `RESEND_API_KEY` in environment variables
2. Try inviting an artist from your admin panel
3. Check that you receive both the invitation and admin copy
4. Verify all links work correctly

## Environment Variables

Add these to your `.env.local`:
```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Optional: Custom from email (after domain verification)
# GALLERY_EMAIL=noreply@yourdomain.com
```

## Customization

### Updating Email Templates
Edit `/src/lib/email.ts` to customize:
- Email styling and branding
- Message content
- Call-to-action buttons
- Gallery information

### Changing the From Address
After setting up domain verification in Resend, update the `from` field in the `sendEmail` function.

## Troubleshooting

### Common Issues

**Emails not sending?**
- Check that `RESEND_API_KEY` is set correctly
- Verify the API key is active in Resend dashboard
- Check server logs for error messages

**Emails going to spam?**
- Set up domain verification in Resend
- Add SPF, DKIM, and DMARC records
- Send from your own domain instead of resend.dev

**Need more emails?**
- Resend free tier: 100 emails/day
- Paid plans start at $20/month for 50,000 emails

## Support

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Email Templates**: Located in `/src/lib/email.ts`
- **Test Emails**: Check your server console output

Your email system is now ready to go! 🚀