const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

async function createTestInvite() {
  try {
    // Get the superadmin user ID (you may need to adjust this)
    const superadmin = await prisma.user.findFirst({
      where: { email: 'austen@thearcades.me' }
    });
    
    if (!superadmin) {
      console.log('❌ Superadmin user not found. Make sure you have a user with email austen@thearcades.me');
      return;
    }

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create the invitation
    const invitation = await prisma.artistInvitation.create({
      data: {
        email: '', // Empty for generic invitation
        token: inviteToken,
        expiresAt,
        invitedBy: superadmin.id,
        customMessage: null,
        status: 'PENDING'
      }
    });

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : process.env.NEXT_PUBLIC_BASE_URL 
        ? `https://${process.env.NEXT_PUBLIC_BASE_URL}` 
        : 'http://localhost:3001'; // Using 3001 since 3000 is in use

    const inviteLink = `${baseUrl}/signup?token=${inviteToken}`;
    
    console.log('✅ Test invite created successfully!');
    console.log('📧 Invitation ID:', invitation.id);
    console.log('🔗 Invite Link:', inviteLink);
    console.log('⏰ Expires:', expiresAt.toLocaleString());
    console.log('');
    console.log('🎨 Artists can now use this link to:');
    console.log('   • Enter their email address');
    console.log('   • Choose their artist URL (slug)');
    console.log('   • Set their display name');
    console.log('   • Create their password');
    console.log('   • Get their portfolio created automatically');
    
  } catch (error) {
    console.error('❌ Error creating test invite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInvite();