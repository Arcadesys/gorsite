-- Migration: Add artist attribution fields to GalleryItem
-- Run this in Supabase SQL editor

ALTER TABLE "GalleryItem" 
ADD COLUMN "artistName" TEXT,
ADD COLUMN "artistPortfolioSlug" TEXT,
ADD COLUMN "artistExternalUrl" TEXT,
ADD COLUMN "isOriginalWork" BOOLEAN NOT NULL DEFAULT true;

-- Add foreign key constraint for artist portfolio slug
-- Note: This will be added after we verify the Portfolio table structure
-- ALTER TABLE "GalleryItem" 
-- ADD CONSTRAINT "GalleryItem_artistPortfolioSlug_fkey" 
-- FOREIGN KEY ("artistPortfolioSlug") REFERENCES "Portfolio"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create an index for better performance when querying by artist
CREATE INDEX IF NOT EXISTS "GalleryItem_artistPortfolioSlug_idx" ON "GalleryItem"("artistPortfolioSlug");
CREATE INDEX IF NOT EXISTS "GalleryItem_artistName_idx" ON "GalleryItem"("artistName");

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'GalleryItem' 
AND column_name IN ('artistName', 'artistPortfolioSlug', 'artistExternalUrl', 'isOriginalWork');