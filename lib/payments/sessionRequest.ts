import type { NextRequest } from "next/server";
import {
  PAYMENT_SESSION_COOKIE,
  verifyPaymentSessionToken,
  type PaymentSessionPublic,
} from "./session";

export function getPaymentSessionFromRequest(
  request: NextRequest | Request
): PaymentSessionPublic | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${PAYMENT_SESSION_COOKIE}=`));

  if (!match) return null;

  const token = decodeURIComponent(match.slice(PAYMENT_SESSION_COOKIE.length + 1));
  return verifyPaymentSessionToken(token);
}
