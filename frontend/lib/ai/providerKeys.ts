import crypto from "crypto";
import { prisma } from "@/lib/db/store";

export type ManagedAiProvider = "openai" | "groq";

const MAX_KEYS = 4;
const PROVIDERS: Record<
  ManagedAiProvider,
  { envPrefix: string; keyPrefix: string; label: string }
> = {
  openai: { envPrefix: "OPENAI_API_KEY", keyPrefix: "sk-", label: "OpenAI" },
  groq: { envPrefix: "GROQ_API_KEY", keyPrefix: "gsk_", label: "Groq" },
};

type EncryptedValue = { iv: string; tag: string; data: string };

function encryptionKey(): Buffer {
  const secret =
    process.env.AI_KEYS_ENCRYPTION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.PAYMENT_SESSION_SECRET?.trim();
  if (!secret) throw new Error("AI key encryption secret is not configured");
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

function environmentKeys(provider: ManagedAiProvider): string[] {
  const prefix = PROVIDERS[provider].envPrefix;
  return [
    process.env[prefix],
    ...Array.from({ length: MAX_KEYS }, (_, index) => process.env[`${prefix}_FALLBACK_${index + 1}`]),
  ]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));
}

export async function getManagedAiKeys(provider: ManagedAiProvider): Promise<string[]> {
  const keys = environmentKeys(provider);
  try {
    const row = await prisma.aiProviderConfig.findUnique({ where: { id: provider } });
    const encrypted = Array.isArray(row?.encryptedKeys) ? row.encryptedKeys : [];
    for (const item of encrypted.slice(0, MAX_KEYS)) {
      try {
        const key = decrypt(item as EncryptedValue).trim();
        if (key) keys.push(key);
      } catch {
        // A rotated encryption secret invalidates only the affected stored slot.
      }
    }
  } catch {
    // Environment keys remain usable when the database is unavailable.
  }
  return [...new Set(keys)];
}

export async function getManagedAiKeyStatus(provider: ManagedAiProvider) {
  const config = PROVIDERS[provider];
  const row = await prisma.aiProviderConfig.findUnique({ where: { id: provider } });
  const encrypted = Array.isArray(row?.encryptedKeys) ? row.encryptedKeys : [];
  return {
    provider,
    primaryConfigured: Boolean(process.env[config.envPrefix]?.trim()),
    fallbackSlots: Array.from({ length: MAX_KEYS }, (_, index) => ({
      slot: index + 1,
      configured:
        Boolean(process.env[`${config.envPrefix}_FALLBACK_${index + 1}`]?.trim()) ||
        Boolean(encrypted[index]),
    })),
    updatedAt: row?.updatedAt?.toISOString() ?? null,
    updatedBy: row?.updatedBy ?? null,
  };
}

export async function replaceManagedAiKeys(
  provider: ManagedAiProvider,
  keys: string[],
  updatedBy: string
) {
  const config = PROVIDERS[provider];
  const normalized = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
  if (normalized.length > MAX_KEYS) {
    throw new Error(`A maximum of ${MAX_KEYS} ${config.label} keys is allowed`);
  }
  if (normalized.some((key) => !key.startsWith(config.keyPrefix))) {
    throw new Error(`Every ${config.label} key must start with ${config.keyPrefix}`);
  }
  return prisma.aiProviderConfig.upsert({
    where: { id: provider },
    create: { id: provider, encryptedKeys: normalized.map(encrypt), updatedBy },
    update: { encryptedKeys: normalized.map(encrypt), updatedBy },
  });
}

export function isManagedAiProvider(value: unknown): value is ManagedAiProvider {
  return value === "openai" || value === "groq";
}
