#!/usr/bin/env node

// Debug script to test image upload API
console.log('🔍 Image Upload Debugging Guide');
console.log('=====================================\n');

console.log('To test image uploads manually:');
console.log('1. Open browser console (F12)');
console.log('2. Navigate to: http://localhost:3001/dashboard/portfolio');
console.log('3. Try uploading an image');
console.log('4. Check console logs for:');
console.log('   - "Starting upload..." messages');
console.log('   - "Upload response status:" messages');
console.log('   - "Input changed: profileImageUrl" or "Input changed: bannerImageUrl"');
console.log('   - "Image upload detected, saving immediately"');
console.log('   - "Saving portfolio..." messages');
console.log('   - "Portfolio saved successfully:" messages\n');

console.log('Expected flow for image upload:');
console.log('1. File selected');
console.log('2. ImageUpload: "Starting upload..."');
console.log('3. ImageUpload: "Upload response status: 200"');
console.log('4. ImageUpload: "Upload successful: { publicUrl: ... }"');
console.log('5. Portfolio: "Input changed: profileImageUrl/bannerImageUrl"');
console.log('6. Portfolio: "Image upload detected, saving immediately"');
console.log('7. Portfolio: "Saving portfolio..."');
console.log('8. Portfolio API: "Syncing banner image:" (for banners)');
console.log('9. Portfolio API: "Portfolio update data:"');
console.log('10. Portfolio: "Portfolio saved successfully:"\n');

console.log('Common issues to check:');
console.log('- Authentication: Make sure you\'re logged in');
console.log('- File size: Must be under 10MB');
console.log('- File type: Must be image/*');
console.log('- Network: Check for CORS or network errors');
console.log('- Database: Verify data is actually saved\n');

console.log('To check database directly:');
console.log('1. Run: npx prisma studio');
console.log('2. Open: http://localhost:5555');
console.log('3. Navigate to Portfolio table');
console.log('4. Check profileImageUrl and bannerImageUrl fields');
console.log('5. For banners, also check heroImageLight, heroImageDark, heroImageMobile\n');

console.log('Manual API test:');
console.log('Run the test-portfolio-debug.js script to test API endpoints directly');