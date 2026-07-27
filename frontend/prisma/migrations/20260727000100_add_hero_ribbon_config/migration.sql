CREATE TABLE "HeroRibbonConfig" (
    "id" TEXT NOT NULL DEFAULT 'hero-offer',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "altText" TEXT NOT NULL DEFAULT 'Special filing offer',
    "showOnMobile" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "HeroRibbonConfig_pkey" PRIMARY KEY ("id")
);
