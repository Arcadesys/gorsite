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
      const resolveBaseUrl = () => {
        const raw = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
        if (raw) return raw.startsWith('http') ? raw : `https://${raw}`;
        const vercel = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
        if (vercel) return `https://${vercel}`;
        if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
        throw new Error('Base URL not configured. Set NEXT_PUBLIC_BASE_URL or VERCEL_URL.');
      };
      const baseUrl = resolveBaseUrl();
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
