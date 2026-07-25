import crypto from "crypto";
import { prisma } from "@/lib/db/store";

const PROVIDER_ID = "groq";
const MAX_FALLBACK_KEYS = 4;

type EncryptedValue = {
  iv: string;
  tag: string;
  data: string;
};

function encryptionKey(): Buffer {
  const secret =
    process.env.AI_KEYS_ENCRYPTION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.PAYMENT_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("AI key encryption secret is not configured");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(value: string): EncryptedValue {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    data: data.toString("base64url"),
  };
}

function decrypt(value: EncryptedValue): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(value.iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(value.tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(value.data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function envKeys(): string[] {
  return [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_FALLBACK_1,
    process.env.GROQ_API_KEY_FALLBACK_2,
    process.env.GROQ_API_KEY_FALLBACK_3,
    process.env.GROQ_API_KEY_FALLBACK_4,
  ]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));
}

export async function getGroqApiKeys(): Promise<string[]> {
  const keys = envKeys();
  try {
    const row = await prisma.aiProviderConfig.findUnique({ where: { id: PROVIDER_ID } });
    const encrypted = Array.isArray(row?.encryptedKeys) ? row.encryptedKeys : [];
    for (const item of encrypted.slice(0, MAX_FALLBACK_KEYS)) {
      try {
        const key = decrypt(item as EncryptedValue).trim();
        if (key) keys.push(key);
      } catch {
        // A rotated encryption secret invalidates only that stored slot.
      }
    }
  } catch {
    // Environment keys remain available if the database is unavailable.
  }
  return [...new Set(keys)];
}

export async function getGroqKeyStatus() {
  const row = await prisma.aiProviderConfig.findUnique({ where: { id: PROVIDER_ID } });
  const encrypted = Array.isArray(row?.encryptedKeys) ? row.encryptedKeys : [];
  return {
    primaryConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
    fallbackSlots: Array.from({ length: MAX_FALLBACK_KEYS }, (_, index) => ({
      slot: index + 1,
      configured:
        Boolean(process.env[`GROQ_API_KEY_FALLBACK_${index + 1}`]?.trim()) ||
        Boolean(encrypted[index]),
    })),
    updatedAt: row?.updatedAt?.toISOString() ?? null,
    updatedBy: row?.updatedBy ?? null,
  };
}

export async function replaceGroqFallbackKeys(keys: string[], updatedBy: string) {
  const normalized = keys.map((key) => key.trim()).filter(Boolean);
  if (normalized.length > MAX_FALLBACK_KEYS) {
    throw new Error(`A maximum of ${MAX_FALLBACK_KEYS} fallback keys is allowed`);
  }
  if (normalized.some((key) => !key.startsWith("gsk_"))) {
    throw new Error("Every Groq key must start with gsk_");
  }
  return prisma.aiProviderConfig.upsert({
    where: { id: PROVIDER_ID },
    create: {
      id: PROVIDER_ID,
      encryptedKeys: normalized.map(encrypt),
      updatedBy,
    },
    update: {
      encryptedKeys: normalized.map(encrypt),
      updatedBy,
    },
  });
}
