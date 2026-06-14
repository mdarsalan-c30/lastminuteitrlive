/** Funnel events per TRUST_CONVERSION §12 */
export type AnalyticsEventName =
  | "landing_cta_click"
  | "import_started"
  | "import_mode_selected"
  | "import_estimate_submitted"
  | "form16_upload"
  | "regime_compare_completion"
  | "presubmit_checklist_green"
  | "paywall_view"
  | "plan_select"
  | "payment_success"
  | "value_stack_impression"
  /** McKinsey M3 — companion digital footprint / field-error rate (see 06_ANALYTICS_EVENTS.md) */
  | "companion_footprint_step_viewed"
  | "companion_field_action"
  | "companion_field_copy"
  | "companion_field_confusion"
  | "companion_wizard_completed";

export type AnalyticsEventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface QueuedAnalyticsEvent {
  name: AnalyticsEventName;
  props?: AnalyticsEventProps;
  timestamp: number;
}
