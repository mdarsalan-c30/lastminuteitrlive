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

/**
 * Landing hero — proportions from Figma layout spec (file 2udbxcHbjth38mlLOKFfyD)
 * Canvas 1440: left col 772px, right rail 517px, gap 23px, calculator card 448px
 */
export const HERO_LAYOUT = {
  shell: "py-6 sm:py-8 lg:py-10",
  container: "max-w-[90rem] px-4 sm:px-6 lg:px-16",
  grid: "grid items-start gap-8 lg:grid-cols-[minmax(0,772fr)_minmax(280px,517fr)] lg:gap-6 xl:gap-[23px]",
  content: "flex min-w-0 flex-col gap-4 lg:max-w-[772px] lg:gap-5",
  headline: "max-w-[720px]",
  subhead: "max-w-[680px]",
  ctaRow: "max-w-[696px]",
  nameForm: "max-w-[520px]",
  calculatorRail:
    "w-full max-w-[28rem] lg:shrink-0 lg:justify-self-end lg:ml-auto",
} as const;

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
