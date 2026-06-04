-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnnouncementConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Announcement Campaign',
    "designType" TEXT NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL DEFAULT 'Special Announcement!',
    "heading" TEXT NOT NULL DEFAULT '',
    "subheading" TEXT NOT NULL DEFAULT '',
    "fontColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "bgColor" TEXT NOT NULL DEFAULT '#000000',
    "gradientColor1" TEXT NOT NULL DEFAULT '#ff7e5f',
    "gradientColor2" TEXT NOT NULL DEFAULT '#feb47b',
    "buttonText" TEXT NOT NULL DEFAULT 'Shop Now',
    "buttonUrl" TEXT NOT NULL DEFAULT '',
    "buttonStyle" TEXT NOT NULL DEFAULT 'solid',
    "countdownDate" TEXT NOT NULL DEFAULT '',
    "cards" TEXT NOT NULL DEFAULT '[]',
    "borderRadius" INTEGER NOT NULL DEFAULT 8,
    "animationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mobileVisible" BOOLEAN NOT NULL DEFAULT true,
    "desktopVisible" BOOLEAN NOT NULL DEFAULT true,
    "rotationTiming" INTEGER NOT NULL DEFAULT 5,
    "badgeLabel" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "scheduledStart" TEXT NOT NULL DEFAULT '',
    "scheduledEnd" TEXT NOT NULL DEFAULT '',
    "targetCountries" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");
