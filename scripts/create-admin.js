// This script creates an admin user in the database
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

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // Update the user to be an admin if they're not already
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' },
        });
        console.log(`User ${email} has been updated to an admin.`);
      } else {
        console.log(`User ${email} is already an admin.`);
      }
      
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`Admin user created successfully with email: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
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