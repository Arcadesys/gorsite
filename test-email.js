#!/usr/bin/env node

/**
 * Email Test Script
 * Tests the email functionality with or without API keys
 */

require('dotenv').config({ path: '.env.local' })

const { sendEmail, generateInvitationEmailHTML } = require('./src/lib/email.ts')

async function testEmail() {
  console.log('🧪 Testing Email Functionality...\n')
  
  // Test data
  const testData = {
    to: 'test@example.com',
    inviteLink: 'https://yoursite.com/signup?token=test123',
    customMessage: 'Welcome to our amazing art gallery! We\'re excited to have you join our community.',
    galleryName: 'The Arcade Art Gallery'
  }

  // Generate HTML content
  const html = generateInvitationEmailHTML({
    inviteLink: testData.inviteLink,
    customMessage: testData.customMessage,
    galleryName: testData.galleryName
  })

  // Attempt to send
  console.log('📧 Attempting to send test email...')
  const result = await sendEmail({
    to: testData.to,
    subject: `Test: You're Invited to Join ${testData.galleryName}`,
    html
  })

  if (result.success) {
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Email sent successfully!')
      console.log('📋 Result:', result.result)
    } else {
      console.log('✅ Email functionality working (logged to console)')
      console.log('💡 Add RESEND_API_KEY to .env.local to send real emails')
    }
  } else {
    console.log('❌ Email failed to send')
    console.log('📋 Error:', result.error)
  }

  console.log('\n🎯 Test completed!')
}

// Run the test
testEmail().catch(console.error)