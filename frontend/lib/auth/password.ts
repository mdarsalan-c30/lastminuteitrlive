import crypto from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;
const SCRYPT_PREFIX = "scrypt$";

/** Hash a password with scrypt (salted). Prefer this for all new credentials. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    })
    .toString("base64url");
  return `${SCRYPT_PREFIX}${salt}$${derived}`;
}

function verifyScrypt(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = parts[1];
  const expected = parts[2];
  if (!salt || !expected) return false;
  const derived = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    })
    .toString("base64url");
  const a = Buffer.from(derived);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Legacy SHA-256 hex (pre-migration). */
function verifyLegacySha256(password: string, stored: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(stored)) return false;
  const candidate = crypto.createHash("sha256").update(password).digest("hex");
  const a = Buffer.from(candidate);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Verify password against scrypt or legacy SHA-256 hashes. */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.startsWith(SCRYPT_PREFIX)) {
    return verifyScrypt(password, storedHash);
  }
  return verifyLegacySha256(password, storedHash);
}

export function isLegacyPasswordHash(storedHash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(storedHash);
}
