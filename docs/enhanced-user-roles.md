// Enhanced user roles to reduce confusion
enum UserRole {
  VISITOR      // Can browse, no upload rights
  ARTIST       // Can create portfolios, galleries, upload art
  ADMIN        // Can manage all users and system settings
  SUPERADMIN   // Full system access including user management
}