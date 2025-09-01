-- Run this in Supabase SQL editor. Adjust bucket name if you changed it.
-- Bucket: artworks
-- Make objects public-readable but writes only by authenticated users.

-- Enable storage if not already
-- create extension if not exists pgjwt with schema extensions; -- managed by Supabase

-- Policy: allow read to anyone
create policy if not exists "Public can read files"
on storage.objects for select
to public
using ( bucket_id = 'artworks' );

-- Policy: only authenticated users can upload to their folder
create policy if not exists "Users can upload to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: users can manage their own files under users/<uid>/
create policy if not exists "Users can update their own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy if not exists "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Optional: admin role can do anything (set custom JWT with role claim)
-- You can skip if not using custom claims.