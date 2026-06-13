import { afterEach, describe, expect, it } from "vitest";
import {
  hasCompanionExportAccess,
  hasServerCompanionAccess,
} from "../access";
import {
  isClientPaymentBypassEnabled,
  isPaymentBypassEnabled,
} from "../bypass";

// process.env.NODE_ENV is typed read-only by @types/node; assign via this helper.
function setNodeEnv(value: string | undefined): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("payment bypass", () => {
  const originalPublic = process.env.NEXT_PUBLIC_BYPASS_PAYMENT;
  const originalTesting = process.env.NEXT_PUBLIC_TESTING_MODE;
  const originalServer = process.env.BYPASS_COMPANION_PAYWALL;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalPublic === undefined) {
      delete process.env.NEXT_PUBLIC_BYPASS_PAYMENT;
    } else {
      process.env.NEXT_PUBLIC_BYPASS_PAYMENT = originalPublic;
    }
    if (originalTesting === undefined) {
      delete process.env.NEXT_PUBLIC_TESTING_MODE;
    } else {
      process.env.NEXT_PUBLIC_TESTING_MODE = originalTesting;
    }
    if (originalServer === undefined) {
      delete process.env.BYPASS_COMPANION_PAYWALL;
    } else {
      process.env.BYPASS_COMPANION_PAYWALL = originalServer;
    }
    setNodeEnv(originalNodeEnv);
  });

  it("is disabled by default in production-like env", () => {
    delete process.env.NEXT_PUBLIC_BYPASS_PAYMENT;
    delete process.env.NEXT_PUBLIC_TESTING_MODE;
    delete process.env.BYPASS_COMPANION_PAYWALL;
    setNodeEnv("production");
    expect(isPaymentBypassEnabled()).toBe(false);
    expect(isClientPaymentBypassEnabled()).toBe(false);
  });

  it("enables via NEXT_PUBLIC_BYPASS_PAYMENT", () => {
    process.env.NEXT_PUBLIC_BYPASS_PAYMENT = "true";
    setNodeEnv("production");
    expect(isPaymentBypassEnabled()).toBe(true);
    expect(isClientPaymentBypassEnabled()).toBe(true);
    expect(
      hasCompanionExportAccess({
        plan: "free",
        paidPlanId: null,
        paymentVerifiedAt: null,
      })
    ).toBe(true);
    expect(hasServerCompanionAccess(null)).toBe(true);
  });

  it("enables client via NEXT_PUBLIC_TESTING_MODE", () => {
    process.env.NEXT_PUBLIC_TESTING_MODE = "true";
    setNodeEnv("production");
    expect(isPaymentBypassEnabled()).toBe(true);
    expect(isClientPaymentBypassEnabled()).toBe(true);
  });

  it("enables via BYPASS_COMPANION_PAYWALL on server only", () => {
    process.env.BYPASS_COMPANION_PAYWALL = "true";
    setNodeEnv("production");
    expect(isPaymentBypassEnabled()).toBe(true);
    expect(isClientPaymentBypassEnabled()).toBe(false);
  });

  it("enables in development without env flags", () => {
    delete process.env.NEXT_PUBLIC_BYPASS_PAYMENT;
    delete process.env.NEXT_PUBLIC_TESTING_MODE;
    delete process.env.BYPASS_COMPANION_PAYWALL;
    setNodeEnv("development");
    expect(isPaymentBypassEnabled()).toBe(true);
    expect(isClientPaymentBypassEnabled()).toBe(true);
  });
});
