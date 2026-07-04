/**
 * Filing state machine (doc 21) — canonical routes for Phase 7.
 * Macro journey A–F still exists for the path bar; this is the UX spine.
 */

export const FILING_STATES = [
  "GATE",
  "BLOCKED",
  "COLLECT",
  "EXTRACT",
  "RECONCILE",
  "CONFIRM",
  "COMPUTE",
  "RISK",
  "ENTITLE",
  "COMPANION",
  "FILED",
  "VERIFIED",
  "LAPSED",
] as const;

export type FilingState = (typeof FILING_STATES)[number];

/** Canonical path per state (doc 40). */
export const STATE_ROUTES: Record<FilingState, string> = {
  GATE: "/file/start",
  BLOCKED: "/file/not-yet",
  COLLECT: "/file/import/documents",
  EXTRACT: "/file/import/documents", // inline on collect (parsing route dies)
  RECONCILE: "/file/import/mismatch",
  CONFIRM: "/file/review",
  COMPUTE: "/file/regime",
  RISK: "/file/review/risk",
  ENTITLE: "/file/checkout/plans",
  COMPANION: "/file/companion",
  FILED: "/file/done",
  VERIFIED: "/file/done?status=verified",
  LAPSED: "/file/done?status=lapsed",
};

/**
 * Kill / merge list (doc 40 §2).
 * Old path → canonical path (query preserved by redirect pages where needed).
 */
export const ROUTE_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/file/onboarding/case-matrix", to: "/file/start" },
  { from: "/file/onboarding/eligibility", to: "/file/start" },
  { from: "/file/onboarding/itr-path", to: "/file/start" },
  { from: "/file/onboarding/profile", to: "/file/start" },
  { from: "/file/import/parsing", to: "/file/import/documents" },
  { from: "/file/import/bank", to: "/file/import/mismatch" },
  { from: "/file/import/tds", to: "/file/import/mismatch" },
  { from: "/file/income", to: "/file/review?tab=income" },
  { from: "/file/house-property", to: "/file/review?tab=income" },
  { from: "/file/other", to: "/file/review?tab=income" },
  { from: "/file/deductions", to: "/file/review?tab=deductions" },
  { from: "/file/advisor", to: "/file/regime" },
  { from: "/file/cabrain", to: "/file/regime" },
  { from: "/file/comprehensive", to: "/file/regime" },
  { from: "/file/profile", to: "/file/start" },
];

export function resolveRedirect(pathname: string): string | null {
  const hit = ROUTE_REDIRECTS.find(
    (r) => pathname === r.from || pathname.startsWith(`${r.from}/`)
  );
  return hit?.to ?? null;
}

export function filingStateFromPath(pathname: string): FilingState {
  if (pathname.startsWith("/file/not-yet")) return "BLOCKED";
  if (pathname.startsWith("/file/done")) return "FILED";
  if (pathname.startsWith("/file/companion") || pathname.startsWith("/file/checkout/everify")) {
    return "COMPANION";
  }
  if (pathname.startsWith("/file/checkout/plans") || pathname.startsWith("/file/checkout/payment")) {
    return "ENTITLE";
  }
  if (pathname.startsWith("/file/review/risk")) return "RISK";
  if (pathname.startsWith("/file/regime")) return "COMPUTE";
  if (pathname.startsWith("/file/review")) return "CONFIRM";
  if (pathname.startsWith("/file/import/mismatch")) return "RECONCILE";
  if (pathname.startsWith("/file/import/documents")) return "COLLECT";
  if (pathname.startsWith("/file/start") || pathname.startsWith("/file/onboarding")) {
    return "GATE";
  }
  return "GATE";
}

/** Felt-step labels (doc 40: 5 felt steps). */
export const FELT_STEPS = [
  { id: "answer", label: "Answer", states: ["GATE", "BLOCKED"] as FilingState[] },
  { id: "upload", label: "Upload", states: ["COLLECT", "EXTRACT"] as FilingState[] },
  { id: "fix", label: "Fix", states: ["RECONCILE", "CONFIRM"] as FilingState[] },
  { id: "number", label: "See your number", states: ["COMPUTE", "RISK"] as FilingState[] },
  { id: "file", label: "File it", states: ["ENTITLE", "COMPANION", "FILED", "VERIFIED", "LAPSED"] as FilingState[] },
] as const;
