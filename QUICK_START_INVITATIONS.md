# Quick Start Guide: New Artist Invitation System

## What's New

You now have a custom-branded email invitation system for The Arcade Art Gallery! 🎨

## How to Invite an Artist

1. **Go to Admin System Page**
   - Navigate to `/admin/system`
   - You'll see the updated invitation form

2. **Send the Invitation**
   - Enter the artist's email
   - Select "ARTIST (Custom branded email)"
   - Add a personal message (optional)
   - Click "Send Invite"

3. **Email is Sent**
   - The system generates a secure invitation
   - Email content is currently logged to your terminal/console
   - Contains a unique signup link that expires in 7 days

## Artist Signup Experience

When an artist clicks the invitation link, they go through this flow:

### Step 1: Choose Artist URL
- They pick their unique URL slug (e.g., "john-artist")
- Real-time checking shows if it's available
- URL will be: `artpop.vercel.app/john-artist`

### Step 2: Create Account
- Enter their display name
- Create a secure password
- Password confirmation

### Step 3: Automatic Setup
- Account created in Supabase
- Portfolio automatically created
- Redirected to studio onboarding

## Viewing Email Content

Since email integration isn't fully configured yet, you can see what the email would contain by:

1. Sending an invitation
2. Checking your terminal/console output
3. Look for "EMAIL TO SEND:" section

The email includes:
- Professional branding as "The Arcade Art Gallery"
- Your custom message
- Clear signup instructions
- Secure invitation link

## Next Steps

### ✅ Email Sending is Already Set Up!

Your invitation system now has **full email functionality** using [Resend](https://resend.com):

1. **Get a free Resend account** at [resend.com](https://resend.com) (100 emails/day free)
2. **Get your API key** from the Resend dashboard
3. **Add to your environment**: `RESEND_API_KEY=re_your_key_here`
4. **That's it!** Emails will automatically send

### Quick Setup (2 minutes):
```bash
# Add to .env.local
RESEND_API_KEY=re_your_api_key_here
```

**Without an API key?** Emails will be logged to your console for testing.

📖 **Full setup guide**: See `EMAIL_SETUP.md` for detailed instructions.

## Benefits of the New System

✅ **Branded experience** - Artists see "The Arcade Art Gallery" branding  
✅ **Personalized** - Include custom messages for each artist  
✅ **Professional** - Proper onboarding flow with slug selection  
✅ **Secure** - Tokens expire in 7 days and are single-use  
✅ **Integrated** - Creates portfolio automatically  

## Difference from Old System

| Old System | New System |
|------------|------------|
| Generic Supabase email | Branded "Arcade Art Gallery" email |
| Basic password setup | Full profile creation with slug |
| Manual portfolio creation | Automatic portfolio creation |
| No customization | Personal messages included |

## Testing

Try inviting yourself to a test email to see the full experience!

1. Use the admin panel to send an invitation
2. Check console for the email content
3. Copy the signup link and test the flow
4. Verify the portfolio was created

The system is ready to use - you just need to add email service integration when you're ready to send real emails!