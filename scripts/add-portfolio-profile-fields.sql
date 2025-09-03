-- Add profile and banner image fields to Portfolio model
ALTER TABLE "Portfolio" ADD COLUMN "profileImageUrl" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "bannerImageUrl" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "bio" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "location" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "website" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Portfolio" ADD COLUMN "socialLinks" JSONB;