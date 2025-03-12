// This script creates or updates the admin user in the database
// Usage: node scripts/create-admin.js <email> <password>

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/create-admin.js <email> <password>');
    process.exit(1);
  }

  const [email, password] = args;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Invalid email format');
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    // Check if any admin user already exists
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    // If an admin already exists, confirm before proceeding
    if (adminCount > 0) {
      console.log('Warning: An admin user already exists.');
      console.log('This script will update the existing admin or create a new one.');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
      
      // Wait for 5 seconds to allow cancellation
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Update the existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Artist Admin'
        },
      });
      console.log(`User ${email} has been updated with new credentials and admin role.`);
    } else {
      // Create a new admin user
      await prisma.user.create({
        data: {
          name: 'Artist Admin',
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`Admin user created successfully with email: ${email}`);
    }

    // Delete any non-admin users for security in single-tenant app
    const deletedCount = await prisma.user.deleteMany({
      where: {
        role: 'USER',
      },
    });

    if (deletedCount.count > 0) {
      console.log(`Removed ${deletedCount.count} non-admin users for security.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error managing admin user:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 