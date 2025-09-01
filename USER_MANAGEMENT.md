# User Management System

## Overview

This application implements a multi-tier user management system with the following roles:

- **Users**: Regular users with basic access
- **Artists**: Users who can create portfolios and galleries
- **Admins**: Users who can manage content and other users (limited scope)
- **Superadmin**: The highest privilege level with full user management capabilities

## Superadmin Privileges

The superadmin is determined by the `SUPERADMIN_EMAIL` environment variable and has the following exclusive capabilities:

### User Account Management

1. **Deactivate Users**: Temporarily disable user accounts
   - Users cannot sign in while deactivated
   - All user data is preserved
   - Can be reversed by reactivating the account

2. **Delete Users**: Permanently remove user accounts
   - Removes the user from Supabase Auth
   - Soft deletes the user record in the local database
   - Cannot be reversed
   - Clears email to allow potential reuse

3. **Invite New Users**: Create new user accounts with specific roles

### API Endpoints

#### User Management
- `GET /api/admin/users` - List all users (admins can view, superadmins see additional fields)
- `POST /api/admin/users` - Invite new users (superadmin only)
- `PATCH /api/admin/users` - Update user roles (admins)
- `PATCH /api/admin/users/[id]` - Manage user status (superadmin only)
- `DELETE /api/admin/users/[id]` - Delete users (superadmin only)

#### User Status Management Actions
- `deactivate` - Disable user account
- `activate` - Re-enable user account  
- `update_role` - Change user role
- `delete` - Permanently remove user (via DELETE method)

### Database Schema

The `User` model includes the following status-related fields:

```prisma
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String?      @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          UserRole     @default(USER)
  status        UserStatus   @default(ACTIVE)
  deactivatedAt DateTime?
  // ... other fields
}

enum UserStatus {
  ACTIVE
  DEACTIVATED
  DELETED
}
```

### Frontend Interface

The admin system page (`/admin/system`) provides a user management interface with:

- User listing with status indicators
- Role management buttons
- Deactivation/reactivation controls
- User deletion functionality
- Visual indicators for user status (deactivated users show with reduced opacity)
- Superadmin badge display
- Safety confirmations for destructive actions

### Security Features

1. **Self-Protection**: Superadmins cannot deactivate or delete their own accounts
2. **Confirmation Dialogs**: All destructive actions require explicit confirmation
3. **Role-Based Access**: Only superadmins can perform user management operations
4. **Audit Trail**: User status changes are timestamped in the database

### Environment Configuration

Required environment variables:

```env
SUPERADMIN_EMAIL=your-admin@example.com
```

This email address determines who has superadmin privileges.

### Migration

To add the user status functionality to an existing installation:

1. Run the database migration:
   ```bash
   npx prisma migrate dev --name add_user_status
   ```

2. Ensure the `SUPERADMIN_EMAIL` environment variable is set

3. Bootstrap the superadmin account if needed via `/admin/setup`

### Usage Guidelines

#### For Superadmins:

1. **Deactivation vs Deletion**:
   - Use deactivation for temporary account suspension
   - Use deletion only for permanent account removal (spam, abuse, etc.)

2. **Before Deleting Users**:
   - Consider the impact on related data (portfolios, galleries, commissions)
   - Ensure you have appropriate backup/export if needed
   - Confirm this is not reversible

3. **Role Management**:
   - Artists can create portfolios and galleries
   - Admins can manage content but have limited user management
   - Only superadmins can invite/deactivate/delete users

### Technical Implementation

The system uses:
- **Supabase Auth** for authentication and session management
- **Prisma** for local database operations
- **Role-based middleware** for API route protection
- **Server-side validation** for all user management operations

User deactivation is implemented by setting a long ban duration in Supabase Auth, while deletion removes the user entirely from the auth system but preserves a soft-deleted record locally for data integrity.