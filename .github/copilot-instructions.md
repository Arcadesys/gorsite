# GitHub Copilot Instructions for gorsite

## Project Overview

**gorsite** is a modern, responsive artist portfolio and commission platform built with Next.js, React, and TypeScript. It supports multi-tenant artist subsites, commission workflows, social media integration, and payment processing.

### Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, TailwindCSS 4+
- **Backend**: Next.js API Routes, Prisma ORM 
- **Database**: PostgreSQL via Supabase (connection pooling + direct connections)
- **Authentication**: NextAuth.js with Supabase integration
- **File Storage**: Supabase Storage with custom bucket policies
- **Payments**: Stripe integration
- **Email**: Resend for transactional emails, Mailchimp for newsletters
- **Deployment**: Vercel (preferred)

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase project with PostgreSQL database
- Environment variables from `.env.example`

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in Supabase, database, and other required variables

# 3. Generate Prisma client and run migrations
npm run db:generate
npx prisma migrate deploy  # or migrate reset --force for fresh setup

# 4. Set up Supabase storage and policies
npm run setup:supabase
# Then run scripts/supabase-policies.sql in Supabase SQL editor

# 5. Create admin user (optional)
node scripts/create-admin.js <email> <password>

# 6. Start development server
npm run dev
```

## File Structure & Conventions

### Key Directories
- `src/app/` - Next.js 13+ app router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions, database clients, auth helpers
- `src/config/` - Configuration files (brand.ts for customization)
- `src/context/` - React contexts (ThemeContext for accent colors)
- `scripts/` - Setup and utility scripts
- `prisma/` - Database schema and migrations
- `public/` - Static assets (branding, placeholders)

### Important Files
- `src/config/brand.ts` - Studio name and branding configuration
- `src/context/ThemeContext.tsx` - Accent color and theme management
- `src/lib/supabase-admin.ts` - Server-side Supabase client with service role
- `src/lib/auth-helpers.ts` - Authentication utilities and session management
- `prisma/schema.prisma` - Database schema with User, Portfolio, Gallery, Commission models

### Naming Conventions
- **Components**: PascalCase (e.g., `ArtistUpload.tsx`)
- **API Routes**: Lowercase with hyphens (e.g., `/api/admin/users/[id]/reset-password`)
- **Database Models**: PascalCase (User, Portfolio, Gallery, CommissionTier)
- **Environment Variables**: UPPERCASE_SNAKE_CASE
- **Artist URLs**: Lowercase with hyphens (e.g., `/digital-dreams`)

## Architecture Patterns

### Multi-Tenant Structure
- Each artist has a `Portfolio` with unique `slug` for public URLs (`/{slug}`)
- Artists can have multiple `Gallery` collections
- Commission tiers are managed per portfolio
- RLS (Row Level Security) policies enforce data isolation

### Authentication Flow
- NextAuth.js with custom Supabase adapter
- JWT tokens with user metadata (`role`, `is_admin`)
- Middleware protection for `/admin/*`, `/studio/*`, `/dashboard/*` routes
- Superadmin determined by `SUPERADMIN_EMAIL` environment variable

### File Upload Pattern
- Supabase Storage with custom upload API routes
- Server-side image processing with Sharp
- Organized by user ID: `artworks/{userId}/{filename}`
- Proper MIME type validation and file size limits

### Database Patterns
- Use Prisma Client for all database operations
- Prefer server-side data fetching in page components
- Use connection pooling URL for API routes
- Use direct URL for migrations only

## Environment Configuration

### Required Variables
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000  # or production URL
NEXTAUTH_SECRET=<random-secret>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_BUCKET=artworks

# Database
DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"

# Email
RESEND_API_KEY=<resend-api-key>

# Admin
SUPERADMIN_EMAIL=<admin-email>
```

## Development Guidelines

### Code Style
- Use TypeScript strictly - avoid `any` types where possible
- Follow ESLint configuration (npm run lint)
- Use Tailwind CSS for styling with design system classes
- Prefer server components over client components when possible

### API Route Patterns
- Always validate user authentication and authorization
- Use proper HTTP status codes (200, 400, 401, 403, 500)
- Return consistent JSON error formats
- Log important operations with request IDs for debugging

### Component Patterns
- Use `'use client'` directive only when necessary (state, effects, events)
- Prefer composition over prop drilling
- Use React context for theme and global state
- Keep components focused and single-responsibility

#### Example Server Component
```typescript
// Server component for data fetching
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { ClientComponent } from './ClientComponent';

export default async function ServerComponent() {
  const user = await getCurrentUser();
  const data = await prisma.model.findMany({
    where: { userId: user?.id },
  });

  return <ClientComponent data={data} />;
}
```

#### Example Client Component
```typescript
'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  data: DataType[];
}

export function ClientComponent({ data }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { accentColor } = useTheme();

  const handleAction = async () => {
    setIsLoading(true);
    try {
      // API call
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`accent-${accentColor}`}>
      {/* Component content */}
    </div>
  );
}
```

### Database Best Practices
- Always use transactions for multi-table operations
- Include proper error handling for Prisma operations
- Use `findUniqueOrThrow` when you expect exactly one result
- Consider soft deletes for user data preservation

#### Example Database Operations
```typescript
// Multi-table transaction
const result = await prisma.$transaction(async (tx) => {
  const portfolio = await tx.portfolio.create({
    data: { slug, displayName, userId },
  });
  
  const gallery = await tx.gallery.create({
    data: {
      userId,
      name: 'Commissions',
      slug: 'commissions',
      isPublic: false,
    },
  });
  
  return { portfolio, gallery };
});

// Error handling with Prisma
try {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { portfolio: true },
  });
} catch (error) {
  if (error.code === 'P2025') {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  throw error;
}
```

## Testing & Quality

### Available Scripts
- `npm run test` - Run Vitest test suite
- `npm run lint` - ESLint code quality checks
- `npm run build` - Production build (includes Prisma generation)
- `npm run db:studio` - Open Prisma Studio for database inspection

### Common Issues
- Always run `npx prisma generate` after schema changes
- Use connection pooling URL for runtime, direct URL for migrations
- Ensure Supabase RLS policies are set up via `scripts/supabase-policies.sql`
- Check environment variables are properly configured in Vercel

## Deployment

### Vercel Setup
```bash
# Set up environment variables
npm run setup:vercel

# Deploy
vercel --prod
```

### Database Migrations
```bash
# Development
npx prisma migrate dev --name <migration-name>

# Production
npx prisma migrate deploy
```

## Customization

### Branding
- Update `src/config/brand.ts` for studio name
- Replace `public/branding/arcades-hero.png` with custom hero image
- Use `public/placeholder-hero.svg` as fallback
- Customize accent colors in `src/context/ThemeContext.tsx` or via UI

### Multi-Tenant Features
- Artists are invited via Admin UI (`/admin/system`)
- Each artist chooses unique slug during signup
- Public galleries accessible at `/{artist-slug}` and `/{artist-slug}/galleries`
- Admin can manage all portfolios via `/admin/portfolios`

## Troubleshooting

### Common Setup Issues
1. **Prisma Client errors**: Run `npx prisma generate`
2. **Database connection issues**: Check DATABASE_URL and DIRECT_URL formats
3. **File upload failures**: Verify Supabase storage policies and bucket configuration
4. **Authentication issues**: Ensure NextAuth secret and Supabase keys are correct
5. **Build failures**: Check TypeScript errors and missing environment variables

### Debug Scripts
- `scripts/test-auth-upload.js` - Test authentication and file upload
- `scripts/ensure-superadmin.js` - Bootstrap admin user
- `test-email.js` - Test email configuration

## API Routes Structure

The API follows RESTful conventions with nested resources:

```
/api/
├── admin/           # Admin-only endpoints (superadmin access)
│   ├── users/       # User management (deactivate, delete, invite)
│   └── supabase/    # Supabase admin operations
├── artist/          # Artist-specific operations
├── galleries/       # Gallery CRUD operations
├── portfolios/      # Portfolio management and public access
├── studio/          # Artist studio dashboard endpoints
├── uploads/         # File upload handling
└── auth/           # Authentication endpoints
```

### API Route Patterns
- Use `[id]` for dynamic segments (e.g., `/api/users/[id]/route.ts`)
- Implement proper HTTP methods (GET, POST, PATCH, DELETE)
- Always include authentication checks using `getCurrentUser()`
- Return consistent error responses with proper status codes
- Use request ID logging for debugging complex operations

#### Example API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your logic here
    const result = await prisma.model.findUnique({
      where: { id: params.id, userId: user.id }, // Ensure user owns the resource
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Theme and Styling System

### Accent Colors
Available accent colors defined in `ThemeContext.tsx`:
- `pink` - Pink/magenta theme
- `purple` - Purple/violet theme  
- `blue` - Blue/cyan theme
- `green` - Green/emerald theme (default)
- `orange` - Orange/amber theme

### Color Mode
- `dark` - Dark theme (default)
- `light` - Light theme
- Auto-detects system preference on first visit
- Persisted in localStorage

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the accent color system for interactive elements
- Maintain consistent spacing using Tailwind's spacing scale
- Use CSS variables for theme-aware colors
- Responsive design with mobile-first approach

## Security Considerations

### Authentication Middleware
- Routes under `/admin/*` require superadmin role
- Routes under `/studio/*` and `/dashboard/*` require user authentication
- API routes validate session tokens and user permissions
- Proper error handling to prevent information disclosure

### Data Access Patterns
- Use Prisma's built-in validation and type safety
- Implement proper authorization checks (user can only access their own data)
- Supabase RLS policies enforce database-level security
- File uploads are scoped to user directories

### Environment Security
- Never expose service role keys in client-side code
- Use environment variable validation in API routes
- Separate database URLs for connection pooling vs migrations
- Rotate secrets regularly in production

## Performance Considerations

### Database Optimization
- Use connection pooling for API routes (`DATABASE_URL`)
- Implement proper indexing on frequently queried fields
- Use Prisma's `select` to limit returned fields
- Consider pagination for large datasets

### File Handling
- Compress images during upload using Sharp
- Implement file size limits and MIME type validation
- Use CDN for static assets in production
- Cache frequently accessed images

### Frontend Performance
- Use Next.js Image component for optimized image loading
- Implement proper loading states and error boundaries
- Minimize client-side JavaScript with server components
- Use dynamic imports for heavy components

## Contributing

When working on this codebase:
1. Always test authentication flows after changes
2. Verify multi-tenant data isolation
3. Test file upload and image processing
4. Check responsive design on mobile devices
5. Validate email notifications are working
6. Ensure admin functions remain secure
7. Run linting and type checking before committing
8. Test with different accent colors and color modes
9. Verify Supabase RLS policies are working correctly

For questions about specific implementations, refer to the comprehensive documentation in README.md, USER_MANAGEMENT.md, and SLUG_MANAGEMENT.md files.