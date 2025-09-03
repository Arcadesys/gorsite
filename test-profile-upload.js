const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testProfileUpload() {
  console.log('Testing profile image upload API...');
  
  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU2/4wAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('type', 'profile');
    
    const response = await fetch('http://localhost:3001/api/uploads/profile', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload API test successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ Upload API test failed:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run the test
testProfileUpload();