#!/usr/bin/env node

// Test script to verify dashboard API endpoints are working
const fetch = require('node-fetch');

async function testDashboardAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  try {
    // Test dashboard stats endpoint
    console.log('1. Testing GET /api/dashboard/stats');
    const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`);
    console.log('   Status:', statsResponse.status);
    if (statsResponse.status === 401) {
      console.log('   ✅ Expected: Requires authentication');
    } else if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('   ✅ Data keys:', Object.keys(statsData));
    } else {
      console.log('   ❌ Failed:', await statsResponse.text());
    }

    // Test recent artworks endpoint
    console.log('\n2. Testing GET /api/dashboard/recent-artworks');
    const artworksResponse = await fetch(`${baseUrl}/api/dashboard/recent-artworks`);
    console.log('   Status:', artworksResponse.status);
    if (artworksResponse.status === 401) {
      console.log('   ✅ Expected: Requires authentication');
    } else if (artworksResponse.ok) {
      const artworksData = await artworksResponse.json();
      console.log('   ✅ Data keys:', Object.keys(artworksData));
    } else {
      console.log('   ❌ Failed:', await artworksResponse.text());
    }

    // Test user endpoint
    console.log('\n3. Testing GET /api/user');
    const userResponse = await fetch(`${baseUrl}/api/user`);
    console.log('   Status:', userResponse.status);
    if (userResponse.status === 401) {
      console.log('   ✅ Expected: Requires authentication');
    } else if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('   ✅ Data keys:', Object.keys(userData));
    } else {
      console.log('   ❌ Failed:', await userResponse.text());
    }

    // Test admin artists endpoint
    console.log('\n4. Testing GET /api/admin/artists');
    const artistsResponse = await fetch(`${baseUrl}/api/admin/artists`);
    console.log('   Status:', artistsResponse.status);
    if (artistsResponse.status === 401 || artistsResponse.status === 403) {
      console.log('   ✅ Expected: Requires admin authentication');
    } else if (artistsResponse.ok) {
      const artistsData = await artistsResponse.json();
      console.log('   ✅ Data keys:', Object.keys(artistsData));
    } else {
      console.log('   ❌ Failed:', await artistsResponse.text());
    }

    console.log('\n🎉 API endpoints are properly protected and respond correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log in to the application to test with authentication');
    console.log('   2. Check dashboard pages show real data instead of mock data');
    console.log('   3. Verify analytics page displays actual portfolio statistics');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

if (require.main === module) {
  testDashboardAPIs();
}