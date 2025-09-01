// Create required Supabase resources (storage bucket) using service role key
// Usage: node scripts/setup-supabase.js [bucketName]

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || process.argv[2] || 'artworks';

  if (!url || !serviceRole) {
    console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  // Ensure bucket exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Failed to list buckets:', listErr.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === bucket);
  if (!exists) {
    console.log(`Creating storage bucket: ${bucket}`);
    const { error: createErr } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 25, // 25MB per file
    });
    if (createErr) {
      console.error('Failed to create bucket:', createErr.message);
      process.exit(1);
    }
  } else {
    console.log(`Bucket '${bucket}' already exists.`);
  }

  console.log('Note: To enforce RLS policies on storage (recommended), run scripts/supabase-policies.sql in the Supabase SQL editor.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
