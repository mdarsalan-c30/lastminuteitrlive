import type { AnalyticsEventName, AnalyticsEventProps } from "./events";

/** Analytics sink — PostHog wired via `createPostHogProvider` when env key is set. */
export interface AnalyticsProvider {
  readonly name: string;
  track(name: AnalyticsEventName, props?: AnalyticsEventProps): void;
  flush?(): Promise<void>;
}

/** Default no-op provider — swap via `setAnalyticsProvider` when keys are available. */
export const noopAnalyticsProvider: AnalyticsProvider = {
  name: "noop",
  track() {},
};

export class QueuedAnalyticsProvider implements AnalyticsProvider {
  readonly name = "queue";

  constructor(private readonly sink: AnalyticsProvider = noopAnalyticsProvider) {}

  track(name: AnalyticsEventName, props?: AnalyticsEventProps): void {
    this.sink.track(name, props);
  }
}
