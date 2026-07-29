CREATE TABLE "HeroLiveStatConfig" (
    "id" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 6578,
    "incrementBy" INTEGER NOT NULL DEFAULT 200,
    "intervalHours" INTEGER NOT NULL DEFAULT 4,
    "baseAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "HeroLiveStatConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "HeroLiveStatConfig" (
    "id", "baseValue", "incrementBy", "intervalHours", "baseAt", "updatedAt"
) VALUES (
    'hero-live-stat', 6578, 200, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
