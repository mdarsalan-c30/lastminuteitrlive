import { describe, expect, it } from "vitest";
import {
  createPaymentSessionToken,
  verifyPaymentSessionToken,
} from "../session";

describe("payment session tokens", () => {
  it("round-trips a verified session payload", () => {
    const token = createPaymentSessionToken({
      planId: "diy",
      orderId: "order_test_1",
      paymentId: "pay_test_1",
      verifiedAt: Date.now(),
      mock: true,
    });

    const session = verifyPaymentSessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.planId).toBe("diy");
    expect(session?.orderId).toBe("order_test_1");
    expect(session?.verified).toBe(true);
  });

  it("rejects tampered signatures", () => {
    const token = createPaymentSessionToken({
      planId: "ai_smart",
      orderId: "order_test_2",
      paymentId: "pay_test_2",
      verifiedAt: Date.now(),
      mock: false,
    });

    const [encoded] = token.split(".");
    const tampered = `${encoded}.invalid-signature`;
    expect(verifyPaymentSessionToken(tampered)).toBeNull();
  });

  it("rejects expired sessions", () => {
    const token = createPaymentSessionToken({
      planId: "diy",
      orderId: "order_expired",
      paymentId: "pay_expired",
      verifiedAt: Date.now() - 60_000,
      mock: true,
      exp: Date.now() - 1,
    });

    expect(verifyPaymentSessionToken(token)).toBeNull();
  });
});
