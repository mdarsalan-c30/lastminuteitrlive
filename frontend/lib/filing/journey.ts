export const JOURNEY_STEPS = [
  {
    id: "A",
    label: "Inputs",
    screen: "Screen 1",
    engine: "Collect salary, identity, and document data",
  },
  {
    id: "B",
    label: "Compute",
    screen: "Screen 1",
    engine: "Parse Form 16 and run first tax estimate",
  },
  {
    id: "C",
    label: "Questions",
    screen: "Screen 2–3",
    engine: "Resolve mismatches and follow-up prompts",
  },
  {
    id: "D",
    label: "Recompute",
    screen: "Screen 2–3",
    engine: "Refresh regime comparison and analytics",
  },
  {
    id: "E",
    label: "Recommend",
    screen: "Screen 4",
    engine: "Optimization tips, review, and plan choice",
  },
  {
    id: "F",
    label: "File",
    screen: "Screen 4",
    engine: "Companion guide, portal steps, e-verify",
  },
] as const;

export type JourneyStepId = (typeof JOURNEY_STEPS)[number]["id"];

/** User-facing macro process labels — plain language for ProductProcessFlow */
export const PRODUCT_PROCESS_STEPS: ReadonlyArray<{
  id: JourneyStepId;
  label: string;
}> = [
  { id: "A", label: "Get started" },
  { id: "B", label: "Import data" },
  { id: "C", label: "Reconcile details" },
  { id: "D", label: "Compute & compare" },
  { id: "E", label: "Review & pay" },
  { id: "F", label: "File on portal" },
];

const JOURNEY_ORDER: JourneyStepId[] = ["A", "B", "C", "D", "E", "F"];

export function getJourneyStepIndex(step: JourneyStepId): number {
  return JOURNEY_ORDER.indexOf(step);
}

/** 1-based macro index for process-flow UI (A→1 … F→6). */
export function getProductProcessStepNumber(step: JourneyStepId): number {
  return getJourneyStepIndex(step) + 1;
}

export function getProductProcessStepFromPath(pathname: string): JourneyStepId {
  return getJourneyStep(pathname);
}

export function getProductProcessLabel(step: JourneyStepId): string {
  return (
    PRODUCT_PROCESS_STEPS.find((item) => item.id === step)?.label ?? "Get started"
  );
}

/**
 * Entry route for each macro step — used by the guided Path bar so completed and
 * current steps are navigable (Salesforce-Path style). Each href maps back to its
 * own journey step so the active highlight stays consistent after navigation.
 */
const PRODUCT_PROCESS_ROUTES: Record<JourneyStepId, string> = {
  A: "/file/start",
  B: "/file/import/documents",
  C: "/file/import/mismatch",
  D: "/file/regime",
  E: "/file/review",
  F: "/file/companion",
};

export function getProductProcessRoute(step: JourneyStepId): string {
  return PRODUCT_PROCESS_ROUTES[step];
}

/** Map filing routes to A–F journey steps (spreadsheet engine map). */
export function getJourneyStep(pathname: string): JourneyStepId {
  if (
    pathname.startsWith("/file/companion") ||
    pathname.startsWith("/file/checkout/everify") ||
    pathname.startsWith("/file/checkout/tracker") ||
    pathname.startsWith("/file/support") ||
    pathname.startsWith("/file/done")
  ) {
    return "F";
  }

  if (
    pathname.startsWith("/file/checkout/plans") ||
    pathname.startsWith("/file/checkout/payment") ||
    pathname.startsWith("/file/review")
  ) {
    return "E";
  }

  if (
    pathname.startsWith("/file/regime") ||
    pathname.startsWith("/file/advisor") ||
    pathname.startsWith("/file/cabrain") ||
    pathname.startsWith("/file/comprehensive")
  ) {
    return "D";
  }

  if (
    pathname.startsWith("/file/import/mismatch") ||
    pathname.startsWith("/file/import/bank") ||
    pathname.startsWith("/file/import/tds")
  ) {
    return "C";
  }

  if (
    pathname.startsWith("/file/import/documents") ||
    pathname.startsWith("/file/import/parsing")
  ) {
    return "B";
  }

  // CONFIRM merge targets (doc 40 kill list still resolves for old links)
  if (
    pathname.startsWith("/file/review") ||
    pathname.startsWith("/file/income") ||
    pathname.startsWith("/file/house-property") ||
    pathname.startsWith("/file/other") ||
    pathname.startsWith("/file/deductions")
  ) {
    return "E";
  }

  if (
    pathname.startsWith("/file/start") ||
    pathname.startsWith("/file/not-yet") ||
    pathname.startsWith("/file/onboarding") ||
    pathname.startsWith("/file/profile")
  ) {
    return "A";
  }

  return "A";
}

export function getJourneyScreenLabel(step: JourneyStepId): string {
  return JOURNEY_STEPS.find((item) => item.id === step)?.screen ?? "Screen 1";
}

export const JOURNEY_ROUTE_MAP: ReadonlyArray<{
  step: JourneyStepId;
  routes: readonly string[];
  description: string;
}> = [
  {
    step: "A",
    routes: ["/file/start", "/file/not-yet", "/file/onboarding/signin"],
    description: "GATE — persona questions and honest blocked exit",
  },
  {
    step: "B",
    routes: ["/file/import/documents"],
    description: "COLLECT / EXTRACT — documents and inline parse",
  },
  {
    step: "C",
    routes: ["/file/import/mismatch"],
    description: "RECONCILE — mismatch cards",
  },
  {
    step: "D",
    routes: ["/file/regime"],
    description: "COMPUTE — regime verdict and tax number",
  },
  {
    step: "E",
    routes: [
      "/file/review",
      "/file/review/risk",
      "/file/review/presubmit",
      "/file/checkout/plans",
      "/file/checkout/payment",
    ],
    description: "CONFIRM / RISK / ENTITLE",
  },
  {
    step: "F",
    routes: [
      "/file/companion",
      "/file/done",
      "/file/checkout/everify",
      "/file/checkout/tracker",
      "/file/support",
    ],
    description: "COMPANION / FILED / VERIFIED",
  },
];
