import { afterEach, describe, expect, it } from "vitest";
import {
  clearQueuedEvents,
  getQueuedEvents,
  setAnalyticsProvider,
  trackEvent,
} from "@/lib/analytics";
import { noopAnalyticsProvider } from "@/lib/analytics/provider";

describe("companion footprint analytics", () => {
  afterEach(() => {
    clearQueuedEvents();
    setAnalyticsProvider(noopAnalyticsProvider);
  });

  it("queues companion events without a PostHog key", () => {
    setAnalyticsProvider(noopAnalyticsProvider);

    trackEvent("companion_footprint_step_viewed", {
      form: "ITR-1",
      screenId: "salary",
      screenIndex: 0,
    });
    trackEvent("companion_field_action", {
      form: "ITR-1",
      screenId: "salary",
      fieldLabel: "Gross salary",
      action: "enter",
      hadCopyValue: true,
    });
    trackEvent("companion_field_copy", {
      form: "ITR-1",
      screenId: "salary",
      fieldLabel: "Gross salary",
    });
    trackEvent("companion_field_confusion", {
      form: "ITR-1",
      screenId: "salary",
      fieldLabel: "Gross salary",
      reason: "wrong_field",
    });
    trackEvent("companion_wizard_completed", {
      form: "ITR-1",
      screenCount: 2,
    });

    const events = getQueuedEvents();
    expect(events).toHaveLength(5);
    expect(events.map((e) => e.name)).toEqual([
      "companion_footprint_step_viewed",
      "companion_field_action",
      "companion_field_copy",
      "companion_field_confusion",
      "companion_wizard_completed",
    ]);
  });
});
