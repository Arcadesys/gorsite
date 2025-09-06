# Portfolio Customization Feature

This feature gives users full control over the appearance of their portfolio pages (accessible via their unique `/{slug}` URL).

## Features Implemented ✅

### 1. **Color Customization**
- **Primary Accent Color**: Used for gallery titles, links, and accents
- **Secondary Accent Color**: Used for complementary elements and footer indicators
- **Color Picker Component**: Modern interface with preset colors and custom color input

### 2. **Footer Customization**
- **Custom Footer Text**: Users can add their own copyright text or message
- **Default Fallback**: Automatic copyright notice if no custom text provided
- **Color Indicators**: Small visual indicators showing the user's chosen colors

### 3. **Dashboard Integration**
- **New Navigation Item**: "Customization" added to artist dashboard
- **Live Preview**: Real-time preview of changes as users make them
- **Save Functionality**: Instant saving with visual feedback

### 4. **Database Schema**
New fields added to `Portfolio` model:
```sql
primaryColor    String @default("#10b981")
secondaryColor  String @default("#059669") 
footerText      String?
```

## Usage

### For Users:
1. **Access**: Go to `/dashboard/customization` in your artist dashboard
2. **Color Selection**: Choose primary and secondary colors using the color picker
3. **Footer Text**: Add custom footer text (optional)
4. **Preview**: See changes in real-time in the preview panel
5. **Save**: Click "Save Changes" to apply customizations
6. **View Live**: Click "View Live" to see your portfolio with new customizations

### For Developers:
- **API Endpoint**: `/api/portfolio/customization` (GET/PATCH)
- **Component**: `ColorPicker.tsx` for color selection interface
- **Pages Updated**: `[artist]/page.tsx` and `[artist]/[gallery]/page.tsx` now use custom colors

## Files Created/Modified

### New Files:
- `src/components/ColorPicker.tsx` - Color picker component
- `src/app/dashboard/customization/page.tsx` - Customization dashboard page
- `src/app/api/portfolio/customization/route.ts` - API for saving/loading settings
- `test-customization.js` - Test script to verify functionality

### Modified Files:
- `prisma/schema.prisma` - Added customization fields to Portfolio model
- `src/app/[artist]/page.tsx` - Applied custom colors and footer
- `src/app/[artist]/[gallery]/page.tsx` - Applied custom colors  
- `src/components/DashboardLayout.tsx` - Added customization to navigation

### Database:
- Migration: `20250906140436_add_portfolio_customization` - Adds new fields

## Color Implementation

The customization system applies colors dynamically using inline styles:

```tsx
// Primary color for main accents
<h3 style={{ color: portfolio.primaryColor }}>
  Gallery Title
</h3>

// Secondary color for indicators
<div style={{ backgroundColor: portfolio.secondaryColor }}>
  Color indicator
</div>
```

## API Usage

### Get Current Settings:
```javascript
fetch('/api/portfolio/customization')
```

### Update Settings:
```javascript
fetch('/api/portfolio/customization', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    footerText: 'Custom footer text'
  })
})
```

## Testing

Run the test script to verify everything works:
```bash
node test-customization.js
```

This creates a test portfolio with custom colors and verifies the database integration.

## Next Steps / Future Enhancements

1. **Font Customization**: Allow users to choose fonts
2. **Background Options**: Custom background colors/images
3. **Layout Variants**: Different portfolio layout options
4. **Theme Presets**: Pre-made color combinations
5. **CSS Customization**: Advanced users could add custom CSS
6. **Export/Import**: Share customization settings between portfolios

## Technical Details

- **TypeScript**: Fully typed with proper interfaces
- **Validation**: Server-side color format validation (hex colors)
- **Error Handling**: Comprehensive error handling in API routes
- **Security**: User isolation - users can only modify their own portfolios
- **Performance**: Efficient database queries with selective field retrieval
- **Responsive**: Mobile-friendly color picker and preview interface

The implementation follows the existing codebase patterns and integrates seamlessly with the current dashboard and portfolio system.