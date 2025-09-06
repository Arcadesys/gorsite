#!/usr/bin/env node

// Quick database check to see what portfolios exist
const { PrismaClient } = require('@prisma/client');

async function checkPortfolios() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database for existing portfolios...\n');
    
    // Get all users with their portfolio info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        primaryColor: true,
        secondaryColor: true,
        footerText: true,
        role: true
      }
    });
    
    console.log(`Found ${users.length} users in database:\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 You need to create a user first to test portfolio customization');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Slug: ${user.slug || 'No slug'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Custom Colors: ${user.primaryColor ? 'Yes' : 'No'}`);
      if (user.primaryColor) {
        console.log(`   Primary: ${user.primaryColor}`);
        console.log(`   Secondary: ${user.secondaryColor}`);
        console.log(`   Footer Text: ${user.footerText || 'Default'}`);
      }
      console.log('');
    });
    
    // Test with the first user that has a slug
    const testUser = users.find(user => user.slug);
    if (testUser) {
      console.log(`🎯 Test the footer customization at:`);
      console.log(`   http://localhost:3000/${testUser.slug}`);
      console.log(`   API endpoint: http://localhost:3000/api/artist/${testUser.slug}/portfolio`);
    } else {
      console.log('⚠️  No users have slugs - portfolio pages won\'t work');
      console.log('💡 Set up a portfolio slug in the dashboard first');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkPortfolios();
}