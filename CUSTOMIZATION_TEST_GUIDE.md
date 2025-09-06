# Quick Test Guide for Portfolio Customization

## Prerequisites
- Have the development server running (`npm run dev`)
- Have access to a user account with a portfolio

## Testing Steps

### 1. Database Verification
```bash
# Run the test script to verify database integration
node test-customization.js
```
This creates a test portfolio and verifies all fields work correctly.

### 2. Access the Customization Dashboard
1. Log in to your artist account
2. Go to `/dashboard/customization`
3. You should see:
   - Color picker for primary color
   - Color picker for secondary color  
   - Footer text input field
   - Live preview panel

### 3. Test Color Customization
1. Click the primary color picker
2. Choose a preset color (e.g., red)
3. Notice the preview updates immediately
4. Try the secondary color picker
5. Choose a different color (e.g., blue)
6. See both colors in the preview

### 4. Test Footer Text
1. Add custom text in the footer field
2. Watch the preview update
3. Try leaving it empty (should show default)

### 5. Save and Verify
1. Click "Save Changes"
2. Look for success feedback
3. If you have a public portfolio, click "View Live"
4. Verify your portfolio shows the new colors

### 6. Test Portfolio Pages
Visit your portfolio at `/{your-slug}` and verify:
- Gallery titles use your primary color
- "View all" links use your primary color
- Footer shows your custom text
- Footer has color indicators

### 7. Test Gallery Pages
Visit a specific gallery at `/{your-slug}/{gallery-slug}` and verify:
- Gallery item titles use your primary color

## Expected Results

✅ **Colors Applied**: All portfolio text/accents use your chosen colors  
✅ **Footer Updated**: Custom footer text appears (or default if empty)  
✅ **Color Indicators**: Small colored dots in footer show your color choices  
✅ **Responsive**: Interface works on mobile and desktop  
✅ **Persistent**: Colors remain after page refresh/revisit  

## Troubleshooting

### Colors Not Showing
- Check browser console for errors
- Verify you clicked "Save Changes"
- Try hard refresh (Ctrl+F5 / Cmd+Shift+R)

### Database Errors
- Run: `npx prisma migrate reset --force` then `npx prisma migrate dev`
- Restart development server

### API Errors
- Check server logs for detailed error messages
- Verify authentication (logged in user)

### TypeScript Errors
- The codebase uses `as any` temporarily for new Prisma fields
- Run: `npx prisma generate` to refresh types

## Example Test Data

The test script creates a portfolio with:
- **Primary Color**: `#FF6B6B` (red)
- **Secondary Color**: `#4ECDC4` (teal)  
- **Footer Text**: "Custom footer text for testing"
- **Slug**: `test-customization-{timestamp}`

You can visit this test portfolio to see the feature in action.

## Demo Screenshots

After testing, you should see:
1. **Dashboard**: Color pickers with live preview
2. **Portfolio**: Custom colors applied to all elements
3. **Footer**: Your custom text with color indicators
4. **Gallery**: Consistent color theme throughout

## Clean Up

To remove test data:
```sql
-- Connect to your database and run:
DELETE FROM "Portfolio" WHERE slug LIKE 'test-customization-%';
DELETE FROM "User" WHERE email = 'test@example.com';
```