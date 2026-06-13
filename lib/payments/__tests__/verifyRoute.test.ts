import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/payments/verify/route";
import {
  PAYMENT_SESSION_COOKIE,
  verifyPaymentSessionToken,
} from "../session";

function makeVerifyRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/verify", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts order_mock_ in non-production without Razorpay keys", async () => {
    const response = await POST(
      makeVerifyRequest({
        razorpay_order_id: "order_mock_12345",
        planId: "diy",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      verified: true,
      mock: true,
      orderId: "order_mock_12345",
      planId: "diy",
    });
    expect(data.paymentId).toMatch(/^pay_mock_/);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(PAYMENT_SESSION_COOKIE);

    const token = setCookie
      .split(";")[0]
      .split("=")
      .slice(1)
      .join("=");
    const session = verifyPaymentSessionToken(decodeURIComponent(token));
    expect(session?.planId).toBe("diy");
    expect(session?.verified).toBe(true);
  });

  it("rejects mock orders without a valid plan id", async () => {
    const response = await POST(
      makeVerifyRequest({
        razorpay_order_id: "order_mock_999",
        planId: "invalid_plan",
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid plan id" });
  });

  it("rejects mock path in production when Razorpay keys are missing", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await POST(
      makeVerifyRequest({
        razorpay_order_id: "order_mock_prod",
        planId: "diy",
      })
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: "Payment verification unavailable",
    });
  });

  it("requires order id", async () => {
    const response = await POST(makeVerifyRequest({ planId: "diy" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Missing order id" });
  });

  it("accepts order_free_ for zero-price plans", async () => {
    const response = await POST(
      makeVerifyRequest({
        razorpay_order_id: "order_free_abc",
        planId: "free",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      verified: true,
      mock: true,
      planId: "free",
    });
  });
});
