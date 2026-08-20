CREATE TABLE "HeroOfferRibbonConfig" (
  "id" TEXT NOT NULL DEFAULT 'hero-offer-v2',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT,
  "altText" TEXT NOT NULL,
  "showOnMobile" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,

  CONSTRAINT "HeroOfferRibbonConfig_pkey" PRIMARY KEY ("id")
);

DELETE FROM "HeroRibbonConfig" WHERE "id" = 'hero-offer';
