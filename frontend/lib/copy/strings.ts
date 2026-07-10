/**
 * strings.ts — canonical filing-journey strings (doc 42 §3).
 *
 * The single reviewed home for state-machine microcopy. Screens import from
 * here; no journey literals in JSX (doc 42 §7 — translation is a file, not a
 * refactor). Reviewed against the voice guide; banned words are CI-linted
 * in __tests__/strings.test.ts.
 */

// ── Honesty invariants (doc 42 §6) ──────────────────────────────

export const NOT_GOVERNMENT =
  "LastMinute ITR is not affiliated with the Income Tax Department. Filing happens on incometax.gov.in — we prepare and guide.";

export const YOUR_DATA_LINE =
  "Your documents stay encrypted and are never sold. Delete them anytime.";

export const SELF_FILE_POSITIONING =
  "You file it yourself — we prepare and guide.";

export const ESTIMATE_CHIP = "Estimate · AY 2026-27";

// ── GATE ────────────────────────────────────────────────────────

export const GATE = {
  whyCapitalGains:
    "Selling investments changes which form you need. We check so you never file the wrong one.",
  blockedTitle: "Your case needs an expert's hands — and we bring the expert to you.",
  blockedBody:
    "Your situation needs schedules that work best with a CA alongside you. Here's your guided path forward:",
} as const;

// ── COLLECT / EXTRACT ───────────────────────────────────────────

export const COLLECT = {
  dropzone: "Upload your Form 16 — PDF is fine, even password-protected.",
  aisNudge: "Recommended: your AIS catches income your employer doesn't know about.",
  skipAisAttest:
    "I'll continue without AIS — I understand unreported income can trigger a notice.",
  parseFailed: "We couldn't read this PDF. Type in 4 numbers instead — takes a minute.",
} as const;

// ── RECONCILE ───────────────────────────────────────────────────

export const RECONCILE = {
  mismatchReassure: "That's normal — employers don't know about your investments.",
  actionAdd: "Add it",
  actionKeep: "Keep mine",
  actionDispute: "This is wrong",
  allClear:
    "Everything matches — Form 16, AIS and 26AS all agree. That's the best start possible.",
} as const;

// ── CONFIRM ─────────────────────────────────────────────────────

export const CONFIRM = {
  lowConfidence: "We're not fully sure we read this right. One look?",
} as const;

// ── COMPUTE ─────────────────────────────────────────────────────

export const COMPUTE = {
  refundLabel: "Your refund",
  payableLabel: "Tax to pay",
  bothChecked: "We checked both regimes.",
} as const;

// ── SAVINGS COACH ─────────────────────────────────────────────────

export const SAVINGS_COACH = {
  estimateLabel: "Andaaza hai — final amount ITD portal par confirm hoga.",
  proofLine: "Only claim what you can prove with a receipt, statement, or Form 16.",
  moreSavings:
    "Your CA-style checklist found more lawful savings if you have proof.",
  breakeven:
    "Old regime needs more eligible deductions before it beats the new regime.",
} as const;

// ── RISK ────────────────────────────────────────────────────────

export const RISK = {
  noticeReframe:
    "Notices sound scary. Most are simple mismatches — here's yours in plain language.",
  ack: "I understand",
} as const;

// ── FILED / VERIFIED / LAPSED ───────────────────────────────────

export const FILED = {
  everifyNudge:
    "One last step: e-verify within 30 days or the return doesn't count. Aadhaar OTP takes 2 minutes.",
  verifiedDone:
    "Done. Actually done. Most refunds arrive in 2–5 weeks — we'll be honest: it's the tax department's timeline, not ours.",
  lapsedWarning:
    "Your return isn't verified — after 30 days it's treated as never filed. It's fixable right now, in 2 minutes.",
} as const;

// ── Errors (doc 42 §4 pattern: what happened → data safe → way out) ──

export const ERROR_STATE_DEFAULT = {
  title: "Something went wrong on our side",
  body: "Your answers and documents are saved — nothing is lost. Try again in a moment, or write to us and a human will sort it out.",
} as const;

export const CHECKOUT = {
  couponAtPayment:
    "This code is applied at the payment step — your final discount shows there.",
} as const;

// ── Banned words (doc 42 §1) — exported for the CI lint ─────────

export const BANNED_PHRASES: RegExp[] = [
  /guarantee(?:d)?\s+(?:maximum\s+)?refund/i,
  /maximum\s+refund\s+guarantee/i,
  /100%\s+accurate/i,
  /fully\s+automatic/i,
  /instant\s+refund/i,
  /approved\s+by\s+(?:the\s+)?(?:ITD|income\s+tax\s+department)/i,
];
