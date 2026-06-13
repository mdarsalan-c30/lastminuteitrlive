import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as postQuestions } from "@/app/api/ai/questions/route";
import { POST as postExplain } from "@/app/api/ai/explain/route";

const baseDraft = {
  profile: {
    assessmentYear: "AY 2026-27 (FY 2025-26)",
    residentialStatus: "resident" as const,
    ageBand: "under_60" as const,
  },
  income: {
    grossSalary: 1_200_000,
    tds: 85_000,
    fdInterest: 18_400,
    employer: "Acme Pvt Ltd",
    advanceTax: 0,
    selfAssessmentTax: 0,
    hraReceived: 0,
    actualRentPaid: 0,
    cityTier: "metro" as const,
  },
  houseProperty: {
    propertyType: "none" as const,
    annualRent: 0,
    homeLoanInterest: 0,
    municipalTax: 0,
    coOwnerPercent: 100,
  },
  deductions: {
    section80C: 150_000,
    section80D: 25_000,
    section80GG: 0,
    npsExtra: 50_000,
  },
  incomeChips: ["salary", "fd_interest"],
  connectedConnectors: [],
  mismatchResolved: true,
  lastParseResult: null,
};

function jsonPost(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("AI API routes — no provider keys", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_PROVIDER;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("POST /api/ai/questions returns rule-based fallback", async () => {
    const response = await postQuestions(
      jsonPost("http://localhost/api/ai/questions", {
        draft: baseDraft,
        questionAnswers: {},
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe("rules");
    expect(data.llmUsed).toBe(false);
    expect(data.fallback).toBe(true);
    expect(data.message).toContain("AI not configured");
    expect(Array.isArray(data.questions)).toBe(true);
  });

  it("POST /api/ai/questions rejects invalid body", async () => {
    const response = await postQuestions(
      jsonPost("http://localhost/api/ai/questions", { draft: { income: {} } })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid request" });
  });

  it("POST /api/ai/explain returns rule-based regime fallback", async () => {
    const response = await postExplain(
      jsonPost("http://localhost/api/ai/explain", {
        type: "regime",
        context: {
          recommendedRegime: "new",
          taxOld: 120_000,
          taxNew: 95_000,
          taxSaving: 25_000,
        },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe("rules");
    expect(data.fallback).toBe(true);
    expect(data.message).toContain("AI not configured");
    expect(data.explain.title).toContain("regime");
    expect(data.explain.disclaimer).toContain("guidance only");
  });

  it("POST /api/ai/explain returns deduction fallback", async () => {
    const response = await postExplain(
      jsonPost("http://localhost/api/ai/explain", {
        type: "deduction",
        context: {
          section: "80C",
          eligible: true,
          proofRequired: ["ELSS statement", "PPF passbook"],
        },
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fallback).toBe(true);
    expect(data.explain.title).toContain("80C");
  });
});
