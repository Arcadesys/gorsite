# Production Domain Fix

## Issue
Invitation links are being generated with the wrong domain in production. Instead of `artpop.vercel.app`, they're showing the internal Vercel machine URL.

## Root Cause
The `NEXT_PUBLIC_BASE_URL` environment variable is not set in Vercel's production environment, causing the `getBaseUrl()` function to fall back to the internal Vercel URL.

## Solution

### Option 1: Set Environment Variable in Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://artpop.vercel.app`
   - **Environment**: Production (and Preview if needed)
5. Redeploy the application

### Option 2: Use Vercel CLI
```bash
# Set the environment variable
vercel env add NEXT_PUBLIC_BASE_URL production
# When prompted, enter: https://artpop.vercel.app

# Redeploy
vercel --prod
```

### Option 3: Update vercel.json (Alternative)
Add this to your `vercel.json` file:
```json
{
  "env": {
    "NEXT_PUBLIC_BASE_URL": "https://artpop.vercel.app"
  }
}
```

## Verification
After setting the environment variable and redeploying:

1. Generate a new invitation link from the admin panel
2. Check that the link shows `https://artpop.vercel.app/signup?token=...`
3. Test that the signup process works with the new link

## Current Base URL Logic
The `getBaseUrl()` function checks in this order:
1. `NEXT_PUBLIC_BASE_URL` (needs to be set) ✅
2. `VERCEL_URL` (Vercel's internal URL) ❌ 
3. `localhost:3000` (development only)
4. Throws error if none found

## Files Affected
- `/src/lib/base-url.ts` - Base URL detection logic
- `/src/app/api/admin/generate-invite-link/route.ts` - Uses base URL for invitation links
- `/src/app/api/admin/invite-artist/route.ts` - Uses base URL for invitation emails

## Quick Test
You can test the current base URL by adding this temporary API endpoint:

```typescript
// /src/app/api/test-base-url/route.ts
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/base-url'

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    return NextResponse.json({ 
      baseUrl,
      env: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

Then visit `/api/test-base-url` to see what URL is being generated.