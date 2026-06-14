import { describe, expect, it } from "vitest";
import {
  canExportCompanion,
  canFileGuided,
  canUseMismatchEngine,
  canUseRegimeOptimizer,
  hasCompanionExportAccess,
  hasServerCompanionAccess,
} from "../access";

describe("payment access helpers", () => {
  it("grants companion export only for paid tiers after verification", () => {
    expect(canExportCompanion("free")).toBe(false);
    expect(canExportCompanion("diy")).toBe(true);
    expect(canExportCompanion("ai_smart")).toBe(true);

    expect(
      hasCompanionExportAccess({
        plan: "ai_smart",
        paidPlanId: "ai_smart",
        paymentVerifiedAt: null,
      })
    ).toBe(false);

    expect(
      hasCompanionExportAccess({
        plan: "ai_smart",
        paidPlanId: "ai_smart",
        paymentVerifiedAt: Date.now(),
      })
    ).toBe(true);
  });

  it("gates mismatch engine and regime optimizer to AI Smart and CA", () => {
    expect(canUseMismatchEngine("diy")).toBe(false);
    expect(canUseMismatchEngine("ai_smart")).toBe(true);
    expect(canUseRegimeOptimizer("ca")).toBe(true);
  });

  it("allows guided filing for any non-free plan", () => {
    expect(canFileGuided("free")).toBe(false);
    expect(canFileGuided("diy")).toBe(true);
  });

  it("grants companion export from server session only for paid tiers", () => {
    expect(
      hasServerCompanionAccess({
        verified: true,
        planId: "free",
        orderId: "order_free_1",
        paymentId: "pay_free_1",
        verifiedAt: Date.now(),
        mock: true,
      })
    ).toBe(false);

    expect(
      hasServerCompanionAccess({
        verified: true,
        planId: "diy",
        orderId: "order_1",
        paymentId: "pay_1",
        verifiedAt: Date.now(),
        mock: false,
      })
    ).toBe(true);
  });
});
