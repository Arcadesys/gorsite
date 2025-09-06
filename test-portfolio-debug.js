#!/usr/bin/env node

// Debug script to test portfolio upload and save functionality
const fetch = require('node-fetch');

async function testPortfolioAPI() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🔍 Testing Portfolio API...\n');
  
  try {
    // Test GET endpoint
    console.log('1. Testing GET /api/studio/portfolio');
    const getResponse = await fetch(`${baseUrl}/api/studio/portfolio`);
    console.log('Status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Portfolio data fields:', Object.keys(data.portfolio || {}));
      console.log('Profile Image URL:', data.portfolio?.profileImageUrl);
      console.log('Banner Image URL:', data.portfolio?.bannerImageUrl);
      console.log('Hero Image Light:', data.portfolio?.heroImageLight);
      console.log('Hero Image Dark:', data.portfolio?.heroImageDark);
      console.log('Hero Image Mobile:', data.portfolio?.heroImageMobile);
    } else {
      console.log('GET failed:', await getResponse.text());
    }
    
    console.log('\n2. Testing PATCH with sample banner image');
    const patchData = {
      bannerImageUrl: 'https://example.com/test-banner.jpg'
    };
    
    const patchResponse = await fetch(`${baseUrl}/api/studio/portfolio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchData)
    });
    
    console.log('PATCH Status:', patchResponse.status);
    if (patchResponse.ok) {
      const updatedData = await patchResponse.json();
      console.log('Updated Banner URL:', updatedData.portfolio?.bannerImageUrl);
      console.log('Updated Hero Light:', updatedData.portfolio?.heroImageLight);
      console.log('Banner sync working:', updatedData.portfolio?.bannerImageUrl === updatedData.portfolio?.heroImageLight);
    } else {
      console.log('PATCH failed:', await patchResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('\n❗ Make sure the development server is running on port 3001');
    console.log('   Run: npm run dev');
  }
}

if (require.main === module) {
  testPortfolioAPI();
}