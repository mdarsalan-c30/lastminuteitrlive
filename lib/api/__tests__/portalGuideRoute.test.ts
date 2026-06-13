import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/portal-guide/[form]/route";
import {
  createPaymentSessionToken,
  buildPaymentSessionPayload,
  PAYMENT_SESSION_COOKIE,
} from "@/lib/payments/session";

async function getGuide(form: string) {
  return GET(new Request(`http://localhost/api/portal-guide/${form}`), {
    params: Promise.resolve({ form }),
  });
}

async function postGuide(
  form: string,
  body: Record<string, unknown>,
  withSession = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (withSession) {
    const token = createPaymentSessionToken(
      buildPaymentSessionPayload({
        planId: "diy",
        orderId: "order_mock_test",
        paymentId: "pay_mock_test",
        mock: true,
      })
    );
    headers.cookie = `${PAYMENT_SESSION_COOKIE}=${encodeURIComponent(token)}`;
  }

  const request = new NextRequest(
    `http://localhost/api/portal-guide/${form}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  return POST(request, { params: Promise.resolve({ form }) });
}

describe("portal-guide API", () => {
  it("GET returns steps for ITR-1", async () => {
    const response = await getGuide("ITR-1");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.form).toBe("ITR-1");
    expect(Array.isArray(data.steps)).toBe(true);
    expect(data.steps.length).toBeGreaterThan(0);
    expect(typeof data.totalSteps).toBe("number");
    expect(Array.isArray(data.footprintScreens)).toBe(true);
  });

  it("GET normalizes itr1 alias", async () => {
    const response = await getGuide("itr1");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.form).toBe("ITR-1");
  });

  it("GET rejects invalid form", async () => {
    const response = await getGuide("ITR-9");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("Invalid form"),
    });
  });

  it("POST requires payment session", async () => {
    const response = await postGuide("ITR-1", { paymentUnlocked: true });
    expect(response.status).toBe(402);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("Payment required"),
    });
  });

  it("POST returns personalized guide when session is verified", async () => {
    const response = await postGuide(
      "ITR-1",
      {
        paymentUnlocked: true,
        draft: {
          regime: "new",
          incomeChips: ["salary"],
          recommendedForm: "ITR-1",
          mismatchResolved: true,
          paymentVerifiedAt: Date.now(),
          income: { grossSalary: 1_200_000 },
          houseProperty: { propertyType: "none" },
          deductions: {
            section80C: 150_000,
            section80D: 25_000,
            section80GG: 0,
            npsExtra: 0,
          },
        },
        completedSteps: [],
        mismatches: [],
      },
      true
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.form).toBe("ITR-1");
    expect(data.steps.length).toBeGreaterThan(0);
    expect(data.completedSteps).toBeGreaterThanOrEqual(0);
  });
});
