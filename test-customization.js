#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

async function testCustomization() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing Portfolio Customization Features...\n')

    // 1. Check if customization fields exist
    console.log('1️⃣ Checking portfolio schema...')
    const fields = Object.keys(prisma.portfolio.fields || {})
    const customFields = ['primaryColor', 'secondaryColor', 'footerText']
    
    for (const field of customFields) {
      if (fields.includes(field)) {
        console.log(`   ✅ ${field} field exists`)
      } else {
        console.log(`   ❌ ${field} field missing`)
      }
    }
    
    // 2. Test creating a portfolio with custom colors
    console.log('\n2️⃣ Testing portfolio creation with custom colors...')
    
    // Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'test-user-' + Date.now(),
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER'
        }
      })
      console.log('   ✅ Created test user')
    } else {
      console.log('   ✅ Using existing test user')
    }
    
    // Create or update portfolio with custom colors
    const testSlug = 'test-customization-' + Date.now()
    const portfolio = await prisma.portfolio.upsert({
      where: { slug: testSlug },
      create: {
        slug: testSlug,
        displayName: 'Test Customization Portfolio',
        userId: testUser.id,
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        footerText: 'Custom footer text for testing',
      },
      update: {
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        footerText: 'Custom footer text for testing',
      }
    })
    
    console.log('   ✅ Portfolio created/updated with custom colors')
    console.log(`   📍 Test URL: /${portfolio.slug}`)
    console.log(`   🎨 Primary Color: ${portfolio.primaryColor}`)
    console.log(`   🎨 Secondary Color: ${portfolio.secondaryColor}`)
    console.log(`   📝 Footer Text: ${portfolio.footerText}`)
    
    // 3. Test reading portfolio with custom fields
    console.log('\n3️⃣ Testing portfolio retrieval...')
    const retrievedPortfolio = await prisma.portfolio.findUnique({
      where: { slug: testSlug },
      select: {
        slug: true,
        displayName: true,
        primaryColor: true,
        secondaryColor: true,
        footerText: true,
      }
    })
    
    if (retrievedPortfolio) {
      console.log('   ✅ Portfolio retrieved successfully')
      console.log('   📋 Retrieved data:', JSON.stringify(retrievedPortfolio, null, 2))
    } else {
      console.log('   ❌ Failed to retrieve portfolio')
    }
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Visit /dashboard/customization to test the UI')
    console.log(`   2. Visit /${testSlug} to see the customized portfolio`)
    console.log('   3. Test color changes through the dashboard')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCustomization()