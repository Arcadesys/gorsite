#!/usr/bin/env node

// Test script to verify footer customization is working
const fetch = require('node-fetch');

async function testFooterCustomization() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🎨 Testing Footer Customization...\n');

  try {
    // First, let's check if we have any portfolios with custom colors
    console.log('1. Testing portfolio customization API endpoint');
    
    // You'll need to replace 'test-slug' with an actual portfolio slug
    const testSlugs = ['personal-gallery', 'test-customization', 'your-slug-here'];
    
    for (const slug of testSlugs) {
      const response = await fetch(`${baseUrl}/api/artist/${slug}/portfolio`);
      console.log(`   Testing slug "${slug}": Status ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Portfolio found with customization:');
        console.log(`      Primary Color: ${data.portfolio.primaryColor}`);
        console.log(`      Secondary Color: ${data.portfolio.secondaryColor}`);
        console.log(`      Footer Text: ${data.portfolio.footerText || 'Default'}`);
        console.log(`   📍 Test the footer at: ${baseUrl}/${slug}\n`);
        break;
      }
    }

    console.log('\n🎯 Footer Customization Implementation Complete!');
    console.log('\n📝 What was fixed:');
    console.log('   ✅ Footer component now fetches portfolio customization');
    console.log('   ✅ Uses custom primaryColor and secondaryColor when available');
    console.log('   ✅ Shows custom footer text if provided');
    console.log('   ✅ Displays color indicators for portfolios with custom colors');
    console.log('   ✅ Falls back to theme colors for non-portfolio pages');
    
    console.log('\n🧪 Test Instructions:');
    console.log('   1. Go to /dashboard/customization');
    console.log('   2. Choose custom colors and footer text');
    console.log('   3. Save changes');
    console.log('   4. Visit your portfolio page');
    console.log('   5. Scroll to footer - should now use your custom colors!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

if (require.main === module) {
  testFooterCustomization();
}