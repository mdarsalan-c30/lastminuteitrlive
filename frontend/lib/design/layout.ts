/**
 * Compact layout rules:
 * - Use COMPACT_GRID presets with items-stretch for equal-height rows.
 * - Downgrade typography one tier in dense zones (body → caption → micro).
 * - Footer cluster (FinalCta + SiteFooter) targets ~20vh on 1080p.
 */
export const SECTION_PADDING = "py-16 sm:py-20 lg:py-24";
export const CONTENT_MAX = "max-w-6xl";
export const GRID_GAP = "gap-6 sm:gap-8 lg:gap-10";

export const LEGAL_PROSE_MAX = "max-w-3xl";

export const COMPACT_SECTION = {
  tight: "section-compact-tight",
  footer: "section-footer-tight",
  ctaBand: "section-cta-band",
} as const;

export const COMPACT_GRID = {
  cols2: "grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch",
  cols3: "grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch",
  cols4: "grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-start",
} as const;

export const COMPACT_PAGE_SHELL = "py-6 sm:py-8";

export const TYPOGRAPHY_SCALE = {
  display: "text-[length:var(--text-display)] leading-[1.1] tracking-[-0.02em]",
  headline: "text-[length:var(--text-headline)] leading-[1.2] tracking-[-0.015em]",
  body: "text-[length:var(--text-body)] leading-[1.75] tracking-[0.003em]",
  caption: "text-[length:var(--text-caption)] leading-[1.5] tracking-[0.002em]",
  micro: "text-[length:var(--text-micro)] leading-[1.4] tracking-[0.01em]",
} as const;

/** Filing workspace — wider than marketing compact shell; uses horizontal space beside nav + Genie. */
export const FILING_WORKSPACE = {
  /** Outer grid: main workspace + Genie companion rail */
  grid: "filing-workspace-grid",
  /** Full-width inner content; no marketing max-w-3xl cap */
  content: "filing-workspace-content",
  /** Import documents: upload + ITR summary split (responsive to Genie rail) */
  importLayout: "filing-import-layout",
  /** Connector / mode cards — denser multi-column grid in workspace */
  cardGrid: "filing-workspace-card-grid",
} as const;
