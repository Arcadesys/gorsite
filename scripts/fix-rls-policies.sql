-- Alternative approach: Create new policies with different names
-- Run this in Supabase SQL editor with service role permissions

-- Create new policies with corrected logic
CREATE POLICY "Allow authenticated users to upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artworks'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow users to manage own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'artworks'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'artworks'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'artworks' );

-- List all current policies to see what exists
SELECT policyname, cmd, roles, with_check, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';