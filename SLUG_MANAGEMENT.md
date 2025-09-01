# User Slug Management System

## Overview

Users can now create and manage their own portfolio slug (artist URL) at any time through the Studio interface. This gives artists full control over their public URL and allows them to rebrand or change their identity as needed.

## Features

### ✅ **Full Slug Control**
- Artists can change their URL at any time
- Real-time availability checking
- Format validation and input cleaning
- Visual feedback for availability status

### ✅ **URL Safety**
- Prevents conflicts with existing portfolios
- Validates slug format (lowercase, numbers, hyphens only)
- Minimum 3 character requirement
- Cannot take another artist's slug

### ✅ **User Experience**
- Live preview of the new URL
- Warning about breaking existing links
- Success feedback after saving
- Direct link to view live gallery

## How It Works

### 1. **Accessing Slug Management**
- Go to `/studio` (Studio home page)
- Current URL is displayed prominently
- Click "Manage URL" or "Open Portfolio Settings"
- Or navigate directly to `/studio/portfolio`

### 2. **Changing Your Slug**
- Enter your desired URL in the "Artist URL (Slug)" field
- System automatically formats input (lowercase, removes invalid characters)
- Real-time availability checking shows if URL is taken
- Green checkmark = available, red X = taken
- Warning appears if changing from existing URL

### 3. **Validation Rules**
- Minimum 3 characters
- Only lowercase letters, numbers, and hyphens allowed
- Cannot conflict with existing portfolios
- Cannot be empty

### 4. **Save Process**
- Server validates slug availability one more time
- Updates portfolio record in database
- Returns success confirmation
- User can immediately visit new URL

## User Interface

### Studio Home Page (`/studio`)
```
┌─────────────────────────────────────────┐
│ Your Gallery URL                        │
│ artpop.vercel.app/john-artist    [Manage URL]│
└─────────────────────────────────────────┘
```

### Portfolio Settings Page (`/studio/portfolio`)
```
┌─────────────────────────────────────────┐
│ Your Artist URL                         │
│ artpop.vercel.app/[john-artist    ] ✅      │
│ ✅ This URL is available!               │
│ ⚠️ Changing URL will break existing links│
└─────────────────────────────────────────┘
```

## API Endpoints

### GET /api/studio/check-slug?slug=...
- **Auth**: Authenticated user
- **Purpose**: Check if slug is available for current user
- **Returns**: `{ available: boolean, slug: string, isCurrent: boolean }`

### PATCH /api/studio/portfolio
- **Auth**: Authenticated user  
- **Purpose**: Update portfolio including slug
- **Body**: `{ slug: string, ...otherFields }`
- **Validation**: Checks format and availability before saving

## Database Changes

No new tables required - uses existing `Portfolio` model with `slug` field that was already unique.

## Security Features

1. **User Isolation**: Users can only modify their own portfolio
2. **Conflict Prevention**: Cannot take another user's slug
3. **Format Validation**: Server-side validation prevents invalid URLs
4. **Authentication Required**: Must be logged in to change slug

## Breaking Changes Warning

When a user changes their slug, the system shows a warning:

> ⚠️ **URL Change Warning**: Changing your URL will break existing links to your gallery. Make sure to update any social media profiles or bookmarks that point to your old URL.

## Benefits

### For Artists:
- ✅ Full control over their brand identity
- ✅ Can update URL to match new artistic direction
- ✅ No need to contact admin for URL changes
- ✅ Immediate availability checking
- ✅ Professional, branded URLs

### For Gallery:
- ✅ Reduces admin support requests
- ✅ Empowers artists with self-service tools
- ✅ Maintains URL uniqueness automatically
- ✅ Preserves professional appearance

## Examples

### Initial Setup (via invitation)
1. Artist receives invitation email
2. Chooses slug during signup: `digital-dreams`
3. Gallery URL becomes: `artpop.vercel.app/digital-dreams`

### Later Rebranding
1. Artist goes to `/studio/portfolio`
2. Changes slug from `digital-dreams` to `dream-artist`
3. Gallery URL becomes: `artpop.vercel.app/dream-artist`
4. Old URL (`digital-dreams`) becomes available for others

### Conflict Handling
1. Artist tries to use `popular-artist`
2. System shows "❌ This URL is already taken"
3. Artist tries `popular-artist-2`
4. System shows "✅ This URL is available!"

## Migration

Existing portfolios keep their current slugs - no data migration needed. Artists can change their slug whenever they want using the new interface.

## Future Enhancements

1. **URL History**: Track previous slugs to potentially redirect
2. **Reserved Words**: Prevent use of system routes (`admin`, `api`, etc.)
3. **Slug Suggestions**: Suggest alternatives when desired slug is taken
4. **Custom Domains**: Allow artists to use their own domains
5. **URL Analytics**: Show traffic impact of URL changes