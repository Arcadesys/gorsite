const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getInviteToken() {
  try {
    const latestInvitation = await prisma.artistInvitation.findFirst({
      where: {
        email: 'starfollystudio@gmail.com',
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (latestInvitation) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/signup?token=${latestInvitation.token}`;
      
      console.log('Latest invitation details:');
      console.log('Email:', latestInvitation.email);
      console.log('Token:', latestInvitation.token);
      console.log('Invite Link:', inviteLink);
      console.log('Expires:', latestInvitation.expiresAt);
    } else {
      console.log('No pending invitations found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getInviteToken();