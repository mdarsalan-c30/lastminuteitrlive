import { beforeEach, describe, expect, it } from "vitest";
import { useDraftStore } from "../draft";

describe("useDraftStore reset helpers", () => {
  beforeEach(() => {
    useDraftStore.getState().reset();
  });

  it("resetEligibilityStep clears income chips and form confirmation", () => {
    const store = useDraftStore.getState();
    store.toggleIncomeChip("capital_gains");
    store.setProfile({ residentialStatus: "non_resident" });
    store.setMatrix({ income: "5", age: "d", business: "w" });
    store.setItrConfirmed(true);

    store.resetEligibilityStep();

    const next = useDraftStore.getState();
    expect(next.incomeChips).toEqual([]);
    expect(next.profile.residentialStatus).toBe("resident");
    expect(next.profile.ageBand).toBe("under_60");
    expect(next.matrix).toEqual({ income: "2", age: "a", business: "x" });
    expect(next.itrConfirmed).toBe(false);
    expect(next.seniorMode).toBe(false);
  });

  it("resetOnboardingProfile clears name and consent", () => {
    const store = useDraftStore.getState();
    store.setName("Priya");
    store.setConsentGiven(true);
    store.setProfile({ ageBand: "senior" });

    store.resetOnboardingProfile();

    const next = useDraftStore.getState();
    expect(next.name).toBe("");
    expect(next.consentGiven).toBe(false);
    expect(next.profile.ageBand).toBe("under_60");
  });
});
