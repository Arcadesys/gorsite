#!/usr/bin/env node

/**
 * Debug script to test upload flow and identify RLS issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';

console.log('🔍 Testing Supabase setup...');
console.log('URL:', supabaseUrl);
console.log('Bucket:', bucket);

async function testSupabaseSetup() {
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Test 1: Check if bucket exists
    console.log('\n📦 Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return;
    }
    
    const targetBucket = buckets.find(b => b.name === bucket);
    if (!targetBucket) {
      console.error(`❌ Bucket '${bucket}' not found. Available buckets:`, buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ Bucket found:', targetBucket);

    // Test 2: Check RLS policies
    console.log('\n🔒 Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1);

    if (policiesError) {
      console.log('ℹ️  RLS policy check (this might fail, which is expected):', policiesError.message);
    } else {
      console.log('✅ Can access storage.objects table');
    }

    // Test 3: Try to list files in bucket
    console.log('\n📁 Testing file listing...');
    const { data: files, error: filesError } = await supabase.storage
      .from(bucket)
      .list('', { limit: 5 });

    if (filesError) {
      console.error('❌ Failed to list files:', filesError);
    } else {
      console.log('✅ Files in bucket:', files?.length || 0);
    }

    // Test 4: Check auth user
    console.log('\n👤 Testing auth (service role)...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('ℹ️  Service role auth (expected to not have user):', userError.message);
    } else {
      console.log('Service role user:', user);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Test RLS policy syntax
function testRLSPolicyLogic() {
  console.log('\n🧪 Testing RLS policy logic...');
  
  // Simulate the policy check: (storage.foldername(name))[1] = 'users'
  const testPaths = [
    'users/12345/image.jpg',
    'public/image.jpg',
    'users/67890/nested/image.png',
    'invalid-path.jpg'
  ];

  testPaths.forEach(path => {
    const parts = path.split('/');
    const folderName = parts[0];
    const passesPolicy = folderName === 'users';
    console.log(`  ${path} -> ${passesPolicy ? '✅' : '❌'} (folder: ${folderName})`);
  });
}

async function main() {
  await testSupabaseSetup();
  testRLSPolicyLogic();
  
  console.log('\n💡 If you see RLS violations, make sure:');
  console.log('   1. The "artworks" bucket exists in Supabase');
  console.log('   2. RLS policies are properly configured');
  console.log('   3. File paths start with "users/"');
  console.log('   4. User is properly authenticated');
}

main().catch(console.error);