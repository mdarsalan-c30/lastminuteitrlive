/**
 * Competitor-inspired marketing copy — rewritten for companion-first, compliance-safe positioning.
 * Reference only in comments; never ship competitor claims verbatim.
 */

export const WHY_US = {
  eyebrow: "Why LastMinute ITR",
  headline: "Built for honest last-minute filing",
  subhead:
    "We are not an e-file platform. We prep your numbers, catch mismatches, and guide you on incometax.gov.in — you submit yourself.",
  pillars: [
    {
      id: "mismatch",
      title: "Mismatch checks first",
      detail:
        "Form 16, AIS, and 26AS compared before you copy anything to the portal — fewer refund delays and notices.",
      competitorRef: "ClearTax accuracy claim → our reconcile wedge",
    },
    {
      id: "regime",
      title: "Regime compare on your data",
      detail:
        "Old vs new regime estimated from your draft — not a generic calculator. You pick; we never guarantee a refund.",
      competitorRef: "Quicko Save pillar → lawful regime choice",
    },
    {
      id: "portal",
      title: "Portal companion, not auto-file",
      detail:
        "Copy-ready field guide for incometax.gov.in. We do not submit returns or claim government authorization.",
      competitorRef: "Both e-file CTAs → companion differentiation",
    },
  ],
} as const;

export const SCALE_PROOF = {
  /** Honest early-access framing — do not use ClearTax-style volume claims */
  headline: "Early access for salaried filers",
  detail:
    "We are building in public with beta testers. Figures on this site are estimates until ITD processes your return.",
} as const;

export const IMPORT_STRIP = {
  eyebrow: "Import-first prep",
  headline: "Start with documents you already have",
  subhead:
    "Form 16 and AIS first — same activation pattern as leading filers, without promising zero manual entry.",
  connectors: [
    { id: "form16", label: "Form 16", status: "live" as const },
    { id: "ais", label: "AIS", status: "soon" as const },
    { id: "form26as", label: "Form 26AS", status: "soon" as const },
    { id: "itd", label: "ITD pre-fill", status: "roadmap" as const },
    { id: "groww", label: "Groww P&L", status: "soon" as const },
  ],
} as const;

export const PERSONA_CAROUSEL = {
  eyebrow: "Your situation",
  headline: "Guides for how Indians actually file",
  personas: [
    {
      id: "salaried",
      title: "Salaried",
      hook: "Form 16 scan → salary & TDS review",
      href: "/file/import/documents?source=form16",
      cta: "Upload Form 16",
    },
    {
      id: "job-change",
      title: "Two Form 16s",
      hook: "Combine employers after a mid-year switch",
      href: "/learn/two-form-16-job-change",
      cta: "Job change guide",
    },
    {
      id: "investor",
      title: "Investor",
      hook: "Capital gains need ITR-2 — we flag early",
      href: "/learn/schedule-cg-explained",
      cta: "Capital gains guide",
    },
    {
      id: "senior",
      title: "Senior citizen",
      hook: "Pension, FD interest, 80TTB / 80D",
      href: "/learn/senior-citizen-80ttb",
      cta: "Senior guide",
    },
    {
      id: "ais",
      title: "AIS mismatch",
      hook: "Fix TDS gaps before portal upload",
      href: "/learn/ais-mismatch",
      cta: "AIS guide",
    },
  ],
} as const;

export const EVERIFY_URGENCY = {
  headline: "E-verify within 30 days",
  body:
    "After you submit on incometax.gov.in, e-verification is mandatory within 30 days. An unverified return is treated as if never filed — refund processing will not start.",
  methods: "Aadhaar OTP is usually fastest; net banking and signed ITR-V are alternatives on the portal.",
} as const;
