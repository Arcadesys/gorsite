# Superadmin Gallery Viewing Feature

## Overview
This feature provides superadmins with the ability to view all galleries across the platform for diagnostic and administrative purposes.

## Implementation Details

### 1. API Endpoint: `/api/admin/galleries`
**File:** `src/app/api/admin/galleries/route.ts`

- **Security:** Requires superadmin privileges using `requireSuperAdmin()`
- **Functionality:** Returns all galleries with user information and preview data
- **Data Included:**
  - Gallery basic info (id, name, slug, description, visibility, creation date)
  - Owner user info (id, name, email, role, status)
  - Item count via `_count.items`
  - First 4 gallery items for preview

### 2. Dashboard Page: `/dashboard/admin/galleries`
**File:** `src/app/dashboard/admin/galleries/page.tsx`

- **Access:** SUPERADMIN role only
- **Features:**
  - Grid layout displaying all galleries
  - User information cards showing owner details
  - Gallery preview images (up to 4 items)
  - Status indicators (public/private, user status)
  - Quick actions: View public gallery, Inspect details
  - Artist attribution for gallery items
  - Comprehensive loading and empty states

### 3. Navigation Integration
**File:** `src/components/DashboardLayout.tsx`

- Added "All Galleries" navigation item for SUPERADMIN role
- Placed between "All Artists" and "User Management" for logical grouping
- Uses FaImages icon for consistency

### 4. Testing
**File:** `tests/admin-galleries.test.ts`

- Tests successful gallery retrieval for superadmins
- Tests authorization failure for non-superadmins
- Tests error handling for database failures
- Uses mocked Prisma and auth helpers following existing patterns

## Security Features

1. **Role-Based Access:** Only superadmins can access the API endpoint
2. **Automatic Redirect:** Non-superadmins are redirected to main dashboard
3. **Error Handling:** Graceful handling of API failures
4. **Data Exposure Control:** Only necessary user information is exposed

## User Experience

### For Superadmins:
- New "All Galleries" item appears in sidebar navigation
- Clean, organized view of all galleries with owner context
- Quick access to public galleries and detailed inspection
- Visual indicators for gallery status and user roles

### For Other Users:
- No change in existing functionality
- Existing gallery pages remain unchanged
- No access to admin functionality

## Data Flow

1. User navigates to `/dashboard/admin/galleries`
2. Page checks authentication and fetches from `/api/admin/galleries`
3. API validates superadmin privileges via `requireSuperAdmin()`
4. Database query retrieves all galleries with user and item data
5. Response includes formatted data for UI consumption
6. Page renders galleries with user context and actions

## Benefits for Diagnostics

- **User Context:** See which user owns each gallery
- **Content Overview:** Preview images and item counts
- **Status Visibility:** User status and gallery visibility at a glance
- **Quick Access:** Direct links to public galleries and detailed views
- **Comprehensive View:** All galleries in one place for system monitoring

## Future Enhancements

Potential improvements that could be added:
- Search and filtering capabilities
- Sorting options (by date, user, item count)
- Bulk actions for gallery management
- Export functionality for reporting
- Gallery analytics and statistics