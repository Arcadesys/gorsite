const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkArtist() {
  try {
    console.log('Checking for starfollystudio@gmail.com...\n');
    
    // Check artist invitations
    const invitations = await prisma.artistInvitation.findMany({
      where: {
        email: {
          contains: 'starfollystudio@gmail.com',
          mode: 'insensitive'
        }
      }
    });
    
    console.log('Artist Invitations:');
    if (invitations.length === 0) {
      console.log('No invitations found for starfollystudio@gmail.com');
    } else {
      invitations.forEach(inv => {
        console.log(`- Email: ${inv.email}`);
        console.log(`- Status: ${inv.status}`);
        console.log(`- Created: ${inv.createdAt}`);
        console.log(`- Expires: ${inv.expiresAt}`);
        console.log(`- Accepted: ${inv.acceptedAt || 'Not yet'}`);
        console.log('---');
      });
    }
    
    // Check users
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'starfollystudio@gmail.com',
          mode: 'insensitive'
        }
      }
    });
    
    console.log('\nUsers:');
    if (users.length === 0) {
      console.log('No users found for starfollystudio@gmail.com');
    } else {
      users.forEach(user => {
        console.log(`- Email: ${user.email}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Status: ${user.status}`);
        console.log(`- Created: ${user.createdAt}`);
        console.log('---');
      });
    }
    
    // Check all invitations to see what emails exist
    const allInvitations = await prisma.artistInvitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\nRecent invitations:');
    allInvitations.forEach(inv => {
      console.log(`- ${inv.email} (${inv.status}) - ${inv.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArtist();