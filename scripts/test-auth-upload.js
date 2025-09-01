#!/usr/bin/env node

/**
 * Test actual upload flow with authentication
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';

async function testWithRealAuth() {
  console.log('🔐 Testing upload with real authentication...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // First, let's try to create a test user or sign in
  console.log('\n👤 Testing user authentication...');
  
  // Try to get current user
  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();
  
  if (currentUserError || !currentUser.user) {
    console.log('ℹ️  No current user session');
    
    // Try to sign up a test user
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    console.log(`🔑 Attempting to sign up test user: ${testEmail}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('ℹ️  Sign up failed (user might already exist):', signUpError.message);
      
      // Try to sign in instead
      console.log('🔑 Attempting to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        return;
      }
      
      console.log('✅ Signed in user:', signInData.user.id);
    } else {
      console.log('✅ Signed up user:', signUpData.user?.id);
    }
  } else {
    console.log('✅ Current user:', currentUser.user.id);
  }

  // Now test the upload
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    console.error('❌ No authenticated user for upload test');
    return;
  }

  console.log(`\n📤 Testing upload for user: ${user.user.id}`);
  
  // Create a small test image buffer
  const testImageBuffer = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.split(',')[1], 'base64');
  
  const testKey = `users/${user.user.id}/test-${Date.now()}.png`;
  
  console.log(`📁 Upload path: ${testKey}`);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(testKey, testImageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    console.error('   Message:', uploadError.message);
    console.error('   Status:', uploadError.status);
    console.error('   Details:', uploadError);
  } else {
    console.log('✅ Upload successful:', uploadData.path);
    
    // Test getting public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);
    
    console.log('🌐 Public URL:', publicUrlData.publicUrl);
  }
}

testWithRealAuth().catch(console.error);