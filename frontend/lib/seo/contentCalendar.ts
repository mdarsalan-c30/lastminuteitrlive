/**
 * 90-day SEO cluster calendar (doc 60).
 * Resolves each planned title against live LEARN_ARTICLES inventory.
 */

import { LEARN_ARTICLES } from "@/lib/content/learn-articles";

export type CalendarCluster =
  | "form16"
  | "ais"
  | "regime"
  | "itr_forms"
  | "deductions"
  | "notices"
  | "deadlines"
  | "portal"
  | "trust";

export type CalendarStatus = "live" | "planned";

export interface CalendarEntry {
  week: number;
  cluster: CalendarCluster;
  title: string;
  /** Preferred learn slug when published. */
  targetSlug: string;
  /** Alternate slugs that already cover this intent. */
  aliasSlugs?: string[];
  ctaPath: string;
  ctaLabel: string;
  caReviewRequired: boolean;
}

export interface ResolvedCalendarEntry extends CalendarEntry {
  status: CalendarStatus;
  liveSlug: string | null;
  livePath: string | null;
}

/** Week of 7 Jul 2026 → week of 29 Sep 2026 (13 weeks). */
export const CALENDAR_START_ISO = "2026-07-07";

export const CONTENT_CALENDAR: CalendarEntry[] = [
  // W1 Form16
  {
    week: 1,
    cluster: "form16",
    title: "How to read Form 16 Part B",
    targetSlug: "form-16-guide",
    aliasSlugs: ["form-16-guide", "form16-upload"],
    ctaPath: "/file/import/documents?source=form16",
    ctaLabel: "Upload Form 16",
    caReviewRequired: false,
  },
  {
    week: 1,
    cluster: "form16",
    title: "Form 16 password and common unlock failures",
    targetSlug: "form-16-password",
    ctaPath: "/file/import/documents?source=form16",
    ctaLabel: "Upload Form 16",
    caReviewRequired: false,
  },
  {
    week: 1,
    cluster: "form16",
    title: "Two Form 16s after a job change",
    targetSlug: "two-form-16-job-change",
    ctaPath: "/file/import/documents?source=form16",
    ctaLabel: "Upload both Form 16s",
    caReviewRequired: false,
  },
  // W2 Form16 mistakes
  {
    week: 2,
    cluster: "form16",
    title: "Form 16 vs payslip vs AIS",
    targetSlug: "form16-vs-payslip-vs-ais",
    aliasSlugs: ["ais-vs-26as"],
    ctaPath: "/file/import/documents",
    ctaLabel: "Import documents",
    caReviewRequired: false,
  },
  {
    week: 2,
    cluster: "form16",
    title: "Wrong TDS on Form 16 — what to do",
    targetSlug: "wrong-tds-form-16",
    aliasSlugs: ["tds-not-in-26as-employer-fix"],
    ctaPath: "/file/import/tds",
    ctaLabel: "Check TDS",
    caReviewRequired: true,
  },
  {
    week: 2,
    cluster: "form16",
    title: "Standard deduction on Form 16",
    targetSlug: "standard-deduction-form-16",
    aliasSlugs: ["form-16-guide"],
    ctaPath: "/file/income",
    ctaLabel: "Review salary",
    caReviewRequired: true,
  },
  // W3 AIS core
  {
    week: 3,
    cluster: "ais",
    title: "What is AIS and why it matters",
    targetSlug: "ais-mismatch",
    aliasSlugs: ["download-ais", "download-ais-help"],
    ctaPath: "/file/import/documents",
    ctaLabel: "Import AIS",
    caReviewRequired: false,
  },
  {
    week: 3,
    cluster: "ais",
    title: "AIS vs Form 26AS",
    targetSlug: "ais-vs-26as",
    ctaPath: "/file/import/documents",
    ctaLabel: "Import AIS and 26AS",
    caReviewRequired: false,
  },
  {
    week: 3,
    cluster: "ais",
    title: "Download AIS step-by-step",
    targetSlug: "download-ais",
    aliasSlugs: ["download-ais-help"],
    ctaPath: "/file/import/documents",
    ctaLabel: "Import AIS",
    caReviewRequired: false,
  },
  // W4 AIS mismatch
  {
    week: 4,
    cluster: "ais",
    title: "AIS shows FD interest not in Form 16",
    targetSlug: "bank-fd-interest-ais",
    aliasSlugs: ["ais-mismatch"],
    ctaPath: "/file/import/mismatch",
    ctaLabel: "Reconcile AIS",
    caReviewRequired: true,
  },
  {
    week: 4,
    cluster: "ais",
    title: "AIS dividend income — how to report",
    targetSlug: "ais-dividend-income",
    aliasSlugs: ["ais-mismatch"],
    ctaPath: "/file/import/mismatch",
    ctaLabel: "Reconcile AIS",
    caReviewRequired: true,
  },
  {
    week: 4,
    cluster: "ais",
    title: "How to submit AIS feedback",
    targetSlug: "ais-feedback-step-by-step",
    ctaPath: "/file/import/mismatch",
    ctaLabel: "Review mismatches",
    caReviewRequired: false,
  },
  // W5 Regime
  {
    week: 5,
    cluster: "regime",
    title: "Old vs new regime calculator explained",
    targetSlug: "old-vs-new-regime",
    ctaPath: "/file/regime",
    ctaLabel: "Compare regimes",
    caReviewRequired: true,
  },
  {
    week: 5,
    cluster: "regime",
    title: "87A rebate in the new regime",
    targetSlug: "87a-rebate-new-regime",
    ctaPath: "/file/regime",
    ctaLabel: "See your estimate",
    caReviewRequired: true,
  },
  {
    week: 5,
    cluster: "regime",
    title: "When the old regime still wins",
    targetSlug: "when-old-regime-wins",
    aliasSlugs: ["old-vs-new-regime"],
    ctaPath: "/file/regime",
    ctaLabel: "Compare regimes",
    caReviewRequired: true,
  },
  // W6 Regime edge
  {
    week: 6,
    cluster: "regime",
    title: "Home loan interest and regime choice",
    targetSlug: "home-loan-regime-choice",
    aliasSlugs: ["old-vs-new-regime"],
    ctaPath: "/file/house-property",
    ctaLabel: "Add house property",
    caReviewRequired: true,
  },
  {
    week: 6,
    cluster: "regime",
    title: "HRA in metro cities vs new regime",
    targetSlug: "hra-exemption-itr",
    ctaPath: "/file/deductions",
    ctaLabel: "Check HRA / rent",
    caReviewRequired: true,
  },
  {
    week: 6,
    cluster: "regime",
    title: "Senior citizen tax regime guide",
    targetSlug: "senior-citizen-80ttb",
    ctaPath: "/file/regime",
    ctaLabel: "Compare regimes",
    caReviewRequired: true,
  },
  // W7 ITR forms
  {
    week: 7,
    cluster: "itr_forms",
    title: "ITR-1 vs ITR-2",
    targetSlug: "itr-1-vs-itr-2",
    ctaPath: "/file/onboarding/eligibility",
    ctaLabel: "Check your form",
    caReviewRequired: false,
  },
  {
    week: 7,
    cluster: "itr_forms",
    title: "Who cannot file ITR-1",
    targetSlug: "who-cannot-file-itr-1",
    aliasSlugs: ["itr-1-vs-itr-2", "itr-1-salaried-guide"],
    ctaPath: "/file/onboarding/eligibility",
    ctaLabel: "Check eligibility",
    caReviewRequired: false,
  },
  {
    week: 7,
    cluster: "itr_forms",
    title: "ITR-4 presumptive taxation guide",
    targetSlug: "section-44ada-presumptive-taxation",
    aliasSlugs: ["itr-3-vs-itr-4-freelancers"],
    ctaPath: "/file/onboarding/eligibility",
    ctaLabel: "Start eligibility",
    caReviewRequired: true,
  },
  // W8 ITR forms
  {
    week: 8,
    cluster: "itr_forms",
    title: "Which ITR after a job change",
    targetSlug: "two-form-16-job-change",
    ctaPath: "/file/onboarding/eligibility",
    ctaLabel: "Check your form",
    caReviewRequired: false,
  },
  {
    week: 8,
    cluster: "itr_forms",
    title: "Capital gains usually need ITR-2",
    targetSlug: "schedule-cg-explained",
    aliasSlugs: ["itr-1-vs-itr-2"],
    ctaPath: "/file/onboarding/eligibility",
    ctaLabel: "Check your form",
    caReviewRequired: true,
  },
  {
    week: 8,
    cluster: "itr_forms",
    title: "Defective return u/s 139(9)",
    targetSlug: "defective-return-139-9",
    aliasSlugs: ["common-itr-mistakes"],
    ctaPath: "/file/review/risk",
    ctaLabel: "Review risks",
    caReviewRequired: false,
  },
  // W9 Deductions
  {
    week: 9,
    cluster: "deductions",
    title: "80C limit guide",
    targetSlug: "80c-deduction-guide",
    ctaPath: "/file/deductions",
    ctaLabel: "Add deductions",
    caReviewRequired: true,
  },
  {
    week: 9,
    cluster: "deductions",
    title: "80D for self and parents",
    targetSlug: "80d-health-insurance",
    aliasSlugs: ["80c-hra"],
    ctaPath: "/file/deductions",
    ctaLabel: "Add 80D",
    caReviewRequired: true,
  },
  {
    week: 9,
    cluster: "deductions",
    title: "Extra NPS under 80CCD(1B)",
    targetSlug: "80ccd-1b-nps",
    aliasSlugs: ["80c-deduction-guide"],
    ctaPath: "/file/deductions",
    ctaLabel: "Add NPS",
    caReviewRequired: true,
  },
  // W10 Deductions
  {
    week: 10,
    cluster: "deductions",
    title: "HRA exemption in ITR",
    targetSlug: "hra-exemption-itr",
    ctaPath: "/tools/hra-calculator",
    ctaLabel: "HRA calculator",
    caReviewRequired: true,
  },
  {
    week: 10,
    cluster: "deductions",
    title: "80GG when you have no HRA",
    targetSlug: "80gg-no-hra",
    aliasSlugs: ["hra-exemption-itr"],
    ctaPath: "/file/deductions",
    ctaLabel: "Add rent deduction",
    caReviewRequired: true,
  },
  {
    week: 10,
    cluster: "deductions",
    title: "80TTA and 80TTB savings interest",
    targetSlug: "senior-citizen-80ttb",
    ctaPath: "/file/deductions",
    ctaLabel: "Add interest",
    caReviewRequired: true,
  },
  // W11 Notices & trust
  {
    week: 11,
    cluster: "notices",
    title: "What a 143(1) intimation means",
    targetSlug: "143-1-intimation",
    aliasSlugs: ["common-itr-mistakes"],
    ctaPath: "/file/review/risk",
    ctaLabel: "Review risks",
    caReviewRequired: false,
  },
  {
    week: 11,
    cluster: "notices",
    title: "Outstanding demand on the portal",
    targetSlug: "outstanding-demand",
    aliasSlugs: ["itr-refund-status"],
    ctaPath: "/help",
    ctaLabel: "Help center",
    caReviewRequired: false,
  },
  {
    week: 11,
    cluster: "trust",
    title: "Why we don't auto-file your ITR",
    targetSlug: "file-itr-without-ca",
    aliasSlugs: ["last-minute-filing"],
    ctaPath: "/file/companion",
    ctaLabel: "Portal companion",
    caReviewRequired: false,
  },
  // W12 Deadlines & portal
  {
    week: 12,
    cluster: "deadlines",
    title: "ITR deadline AY 2026-27",
    targetSlug: "itr-deadline-2026",
    ctaPath: "/file",
    ctaLabel: "Start filing",
    caReviewRequired: false,
  },
  {
    week: 12,
    cluster: "deadlines",
    title: "Late fee u/s 234F",
    targetSlug: "late-fee-234f",
    aliasSlugs: ["itr-deadline-2026"],
    ctaPath: "/file",
    ctaLabel: "Start filing",
    caReviewRequired: true,
  },
  {
    week: 12,
    cluster: "portal",
    title: "E-verify with Aadhaar OTP",
    targetSlug: "everify-aadhaar-otp",
    aliasSlugs: ["everify-deadline"],
    ctaPath: "/file/checkout/everify",
    ctaLabel: "E-verify checklist",
    caReviewRequired: false,
  },
  // W13 refresh — point at pillars
  {
    week: 13,
    cluster: "form16",
    title: "Refresh: Form 16 guide (AY labels)",
    targetSlug: "form-16-guide",
    ctaPath: "/file/import/documents?source=form16",
    ctaLabel: "Upload Form 16",
    caReviewRequired: true,
  },
  {
    week: 13,
    cluster: "ais",
    title: "Refresh: AIS mismatch guide",
    targetSlug: "ais-mismatch",
    ctaPath: "/file/import/mismatch",
    ctaLabel: "Reconcile AIS",
    caReviewRequired: true,
  },
  {
    week: 13,
    cluster: "regime",
    title: "Refresh: Old vs new regime",
    targetSlug: "old-vs-new-regime",
    ctaPath: "/file/regime",
    ctaLabel: "Compare regimes",
    caReviewRequired: true,
  },
];

const liveSlugSet = new Set(LEARN_ARTICLES.map((a) => a.slug));

function resolveLiveSlug(entry: CalendarEntry): string | null {
  if (liveSlugSet.has(entry.targetSlug)) return entry.targetSlug;
  for (const alias of entry.aliasSlugs ?? []) {
    if (liveSlugSet.has(alias)) return alias;
  }
  return null;
}

export function resolveCalendarEntry(entry: CalendarEntry): ResolvedCalendarEntry {
  const liveSlug = resolveLiveSlug(entry);
  return {
    ...entry,
    status: liveSlug ? "live" : "planned",
    liveSlug,
    livePath: liveSlug ? `/learn/${liveSlug}` : null,
  };
}

export function getResolvedCalendar(): ResolvedCalendarEntry[] {
  return CONTENT_CALENDAR.map(resolveCalendarEntry);
}

export function getCalendarWeek(week: number): ResolvedCalendarEntry[] {
  return getResolvedCalendar().filter((e) => e.week === week);
}

export function getCalendarCoverage(): {
  total: number;
  live: number;
  planned: number;
  livePct: number;
} {
  const resolved = getResolvedCalendar();
  const live = resolved.filter((e) => e.status === "live").length;
  const total = resolved.length;
  return {
    total,
    live,
    planned: total - live,
    livePct: total === 0 ? 0 : Math.round((live / total) * 100),
  };
}
