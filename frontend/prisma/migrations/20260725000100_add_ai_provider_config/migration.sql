CREATE TABLE "AiProviderConfig" (
    "id" TEXT NOT NULL DEFAULT 'groq',
    "encryptedKeys" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "AiProviderConfig_pkey" PRIMARY KEY ("id")
);
