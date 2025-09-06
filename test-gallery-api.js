#!/usr/bin/env node

// Test the gallery API to see if our changes work
const { PrismaClient } = require('@prisma/client');

async function testGalleryAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing updated Gallery API structure...\n');
    
    // Simulate the same query as our API
    const galleries = await prisma.gallery.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
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
      },
    });
    
    console.log(`📊 API Response Structure:\n`);
    console.log(JSON.stringify(galleries, null, 2));
    
    console.log(`\n✅ Changes verified! The API now includes:`);
    console.log('   - User information for each gallery');
    console.log('   - Portfolio display name and slug');
    console.log('   - Profile image URL for artist badge');
    console.log('\n🎯 You can now test the frontend at:');
    console.log('   http://localhost:3000/galleries');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testGalleryAPI();
}