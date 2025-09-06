#!/usr/bin/env node

// Create a test user with portfolio customization for testing
const { PrismaClient } = require('@prisma/client');

async function createTestPortfolio() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎨 Creating test portfolio with custom colors...\n');
    
    // First create or find a user
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test Artist',
          role: 'USER'
        }
      });
      console.log('✅ Created test user');
    }
    
    // Check if test portfolio already exists
    let testPortfolio = await prisma.portfolio.findUnique({
      where: { slug: 'test-portfolio' }
    });
    
    if (!testPortfolio) {
      // Create a test portfolio with customization
      testPortfolio = await prisma.portfolio.create({
        data: {
          slug: 'test-portfolio',
          displayName: 'Test Artist Portfolio',
          description: 'A test portfolio for testing footer customization',
          userId: testUser.id,
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          footerText: 'Custom footer text for testing!'
        }
      });
      console.log('✅ Created test portfolio with custom colors');
    } else {
      // Update existing portfolio with colors
      testPortfolio = await prisma.portfolio.update({
        where: { slug: 'test-portfolio' },
        data: {
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          footerText: 'Custom footer text for testing!'
        }
      });
      console.log('✅ Updated existing test portfolio with custom colors');
    }
    
    console.log('\n🎯 Test Portfolio Created:');
    console.log(`   Display Name: ${testPortfolio.displayName}`);
    console.log(`   Slug: ${testPortfolio.slug}`);
    console.log(`   Primary Color: ${testPortfolio.primaryColor}`);
    console.log(`   Secondary Color: ${testPortfolio.secondaryColor}`);
    console.log(`   Footer Text: ${testPortfolio.footerText}`);
    
    console.log('\n🧪 Test URLs:');
    console.log(`   Portfolio Page: http://localhost:3000/${testPortfolio.slug}`);
    console.log(`   API Endpoint: http://localhost:3000/api/artist/${testPortfolio.slug}/portfolio`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestPortfolio();
}