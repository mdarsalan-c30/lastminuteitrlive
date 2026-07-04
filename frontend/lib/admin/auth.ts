import crypto from "crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireSessionSecret } from "@/lib/auth/sessionSecret";

export { hashPassword, verifyPassword };

export const ADMIN_SESSION_COOKIE = "ts_admin_session";
/** Admin session lifetime — 12 hours. */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export interface AdminUser {
  email: string;
  passwordHash: string;
  role: string;
}

export interface AdminSession {
  email: string;
  /** Built-in or custom role key; permissions are resolved from the role config. */
  role: string;
  exp: number;
}

function getSessionSecret(): string {
  return requireSessionSecret({
    envKeys: ["ADMIN_SESSION_SECRET", "PAYMENT_SESSION_SECRET"],
    devFallback: "dev-admin-session-secret",
    label: "Admin session",
  });
}

/**
 * Admin users come from the ADMIN_USERS env var (JSON array of
 * {email, passwordHash, role}). In development only, a bootstrap CEO is
 * provided when none is configured.
 */
export function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AdminUser[];
      return parsed.filter(
        (u) =>
          typeof u.email === "string" &&
          typeof u.passwordHash === "string" &&
          typeof u.role === "string" &&
          u.role.length > 0
      );
    } catch {
      // fall through
    }
  }

  if (process.env.NODE_ENV === "production") {
    return [];
  }

  const devPassword = process.env.ADMIN_DEV_PASSWORD ?? "ITR2026";
  return [
    {
      email: "admin@lastminuteitr.local",
      passwordHash: hashPassword(devPassword),
      role: "ceo",
    },
  ];
}

export function verifyCredentials(
  email: string,
  password: string
): AdminUser | null {
  const users = getAdminUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

function sign(encodedPayload: string): string {
  const secret = getSessionSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createAdminSessionToken(user: {
  email: string;
  role: string;
}): string {
  const payload: AdminSession = {
    email: user.email,
    role: user.role,
    exp: Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readAdminSession(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSession;
    if (
      !session ||
      typeof session.email !== "string" ||
      typeof session.role !== "string" ||
      session.role.length === 0 ||
      typeof session.exp !== "number" ||
      session.exp < Date.now()
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  };
}
