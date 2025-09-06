#!/usr/bin/env node

// Quick database check to see what galleries exist
const { PrismaClient } = require('@prisma/client');

async function checkGalleries() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database for existing galleries...\n');
    
    // Get all galleries with their user info
    const galleries = await prisma.gallery.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            portfolios: {
              select: {
                slug: true,
                displayName: true,
                profileImageUrl: true
              },
              take: 1
            }
          }
        }
      }
    });
    
    console.log(`Found ${galleries.length} public galleries in database:\n`);
    
    if (galleries.length === 0) {
      console.log('❌ No public galleries found in database');
      console.log('💡 You need to create a gallery first to test the artist badges');
      return;
    }
    
    galleries.forEach((gallery, index) => {
      const portfolio = gallery.user.portfolios[0];
      console.log(`${index + 1}. Gallery: ${gallery.name}`);
      console.log(`   Slug: ${gallery.slug}`);
      console.log(`   Description: ${gallery.description || 'No description'}`);
      console.log(`   Owner: ${gallery.user.name || 'No name'}`);
      console.log(`   Portfolio: ${portfolio?.displayName || 'No portfolio'} (@${portfolio?.slug || 'no-slug'})`);
      console.log(`   Profile Image: ${portfolio?.profileImageUrl ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log(`🎯 Test the galleries page at:`);
    console.log(`   http://localhost:3001/galleries`);
    console.log(`   API endpoint: http://localhost:3001/api/public/galleries`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkGalleries();
}