/*
  Warnings:

  - You are about to drop the `SocialPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscriber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `title` on the `Commission` table. All the data in the column will be lost.
  - Added the required column `attachments` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientEmail` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientName` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Commission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Subscriber_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SocialPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscriber";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Gorath Artist Portfolio',
    "siteDescription" TEXT NOT NULL DEFAULT 'Digital Artist & Illustrator specializing in fantasy, sci-fi, and character art',
    "primaryColor" TEXT NOT NULL DEFAULT 'pink',
    "secondaryColor" TEXT NOT NULL DEFAULT 'purple',
    "accentColor" TEXT NOT NULL DEFAULT 'pink',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "heroImageUrl" TEXT,
    "showGallery" BOOLEAN NOT NULL DEFAULT true,
    "showCommissions" BOOLEAN NOT NULL DEFAULT true,
    "showSocialFeed" BOOLEAN NOT NULL DEFAULT true,
    "showContact" BOOLEAN NOT NULL DEFAULT true,
    "customCss" TEXT,
    "customHtml" TEXT,
    "commissionTypes" TEXT,
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "waitlistMessage" TEXT,
    "termsAndConditions" TEXT,
    "privacyPolicy" TEXT,
    "googleAnalyticsId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommissionQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Default Queue',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedWaitTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "price" REAL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "finalPaid" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "completedDate" DATETIME,
    "attachments" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "queuePosition" INTEGER,
    "queueId" TEXT,
    "userId" TEXT,
    CONSTRAINT "Commission_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "CommissionQueue" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Commission" ("createdAt", "description", "id", "price", "status", "updatedAt", "userId") SELECT "createdAt", "description", "id", "price", "status", "updatedAt", "userId" FROM "Commission";
DROP TABLE "Commission";
ALTER TABLE "new_Commission" RENAME TO "Commission";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
