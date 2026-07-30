export type JourneyStepId =
  | "about"
  | "documents"
  | "plan"
  | "payment"
  | "income"
  | "calculation"
  | "regime"
  | "guided_check"
  | "final_review";

export interface JourneyStep {
  id: JourneyStepId;
  label: string;
  href: string;
  complete: boolean;
  missing: string[];
}

type AnyDraft = Record<string, any>;

function buildJourneySteps(draft: unknown): JourneyStep[] {
  const d =
    draft && typeof draft === "object" ? (draft as AnyDraft) : ({} as AnyDraft);
  const income = d.income ?? {};
  const connectors: string[] = Array.isArray(d.connectedConnectors)
    ? d.connectedConnectors
    : [];
  const chips: string[] = Array.isArray(d.incomeChips) ? d.incomeChips : [];
  const exact = d.filingMode !== "estimate";
  const pan = String(d.profile?.pan ?? "").trim().toUpperCase();
  const mobile = String(d.profile?.mobile ?? "").replace(/\D/g, "");
  const recommendedForm = String(d.recommendedForm ?? "").trim().toUpperCase();
  const aboutDetailsComplete =
    /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) &&
    /^[6-9][0-9]{9}$/.test(mobile) &&
    /^ITR-[1-4]$/.test(recommendedForm) &&
    chips.length > 0;
  const salarySelected = chips.includes("salary");
  const capitalGainsSelected = chips.includes("capital_gains");
  const houseSelected = chips.includes("house_property");
  const businessSelected =
    chips.includes("freelance") || chips.includes("business_presumptive");
  const answers = d.questionAnswers ?? {};
  const manualDocumentPath =
    answers.document_form16_manual === true ||
    answers.document_ais_manual === true ||
    answers.document_form26as_manual === true;

  return [
    {
      id: "about",
      label: "About You",
      href: "/file/start",
      complete: aboutDetailsComplete,
      missing: [
        ...(!aboutDetailsComplete
          ? ["complete profile and ITR form selection"]
          : []),
      ],
    },
    {
      id: "documents",
      label: "Add Documents",
      href: "/file/import/documents",
      complete:
        !exact ||
        manualDocumentPath ||
        connectors.includes("form16") ||
        connectors.some((id) =>
          ["ais", "form26as", "groww", "zerodha", "cams", "kfintech"].includes(id)
        ),
      missing:
        exact && !manualDocumentPath
          ? ["upload a document or choose manual entry"]
          : [],
    },
    {
      id: "plan",
      label: "Choose a Plan",
      href: "/file/checkout/plans",
      complete:
        ["normal", "pro"].includes(String(d.plan ?? "")) &&
        Number(d.planSelectedAt ?? 0) > 0,
      missing: ["filing plan selection"],
    },
    {
      id: "payment",
      label: "Secure Payment",
      href: "/file/checkout/payment",
      complete:
        Number(d.paymentVerifiedAt ?? 0) > 0 ||
        Boolean(d.paidPlanId),
      missing: ["verified payment"],
    },
    {
      id: "income",
      label: "Income & Tax Savings",
      href: "/file/review",
      complete:
        chips.length > 0 &&
        (!salarySelected ||
          Number(income.grossSalary ?? 0) > 0 ||
          connectors.includes("form16")) &&
        (!capitalGainsSelected || Boolean(d.capitalGains)) &&
        (!houseSelected || d.houseProperty?.propertyType !== "none") &&
        (!businessSelected ||
          Number(income.businessRevenue ?? 0) > 0 ||
          Number(income.freelanceRevenue ?? 0) > 0),
      missing: [
        ...(chips.length === 0 ? ["income source selection"] : []),
        ...(salarySelected &&
        Number(income.grossSalary ?? 0) <= 0 &&
        !connectors.includes("form16")
          ? ["salary details"]
          : []),
        ...(capitalGainsSelected && !d.capitalGains
          ? ["capital gains details"]
          : []),
        ...(houseSelected && d.houseProperty?.propertyType === "none"
          ? ["house property details"]
          : []),
        ...(businessSelected &&
        Number(income.businessRevenue ?? 0) <= 0 &&
        Number(income.freelanceRevenue ?? 0) <= 0
          ? ["business or freelance income"]
          : []),
      ],
    },
    {
      id: "calculation",
      label: "Calculate Tax",
      href: "/file/regime",
      complete: Number(d.calculationCompletedAt ?? 0) > 0,
      missing: ["completed tax calculation"],
    },
    {
      id: "regime",
      label: "Compare Tax Option",
      href: "/file/regime",
      complete: d.regime === "old" || d.regime === "new",
      missing: ["tax regime selection"],
    },
    {
      id: "guided_check",
      label: "Guided Tax Check",
      href: "/file/advisor",
      complete: Number(d.guidedCheckCompletedAt ?? 0) > 0,
      missing: ["guided tax check"],
    },
    {
      id: "final_review",
      label: "Final Review",
      href: "/file/review/risk#final-check",
      complete: Number(d.finalReviewCompletedAt ?? 0) > 0,
      missing: [
        ...(Number(d.finalReviewCompletedAt ?? 0) <= 0
          ? ["final review confirmation"]
          : []),
      ],
    },
  ];
}

function summarizeJourney(steps: JourneyStep[]) {
  const firstIncomplete = steps.find((step) => !step.complete) ?? null;
  const firstIncompleteIndex = firstIncomplete
    ? steps.findIndex((step) => step.id === firstIncomplete.id)
    : steps.length;
  return {
    complete: firstIncomplete === null,
    firstIncomplete,
    steps,
    completedCount: firstIncompleteIndex,
    currentStepNumber: Math.min(firstIncompleteIndex + 1, steps.length),
  };
}

/** Complete ordered journey, including commerce and filing readiness. */
export function evaluateJourney(draft: unknown) {
  return summarizeJourney(buildJourneySteps(draft));
}

/** Minimum safe setup required before an order may be created. */
export function evaluatePaymentJourney(draft: unknown) {
  return summarizeJourney(
    buildJourneySteps(draft).filter((step) =>
      ["about", "documents", "plan"].includes(step.id)
    )
  );
}

/** Work that remains after payment before copy-ready portal access is allowed. */
export function evaluatePostPaymentJourney(draft: unknown) {
  return summarizeJourney(
    buildJourneySteps(draft).filter((step) =>
      ["income", "calculation", "regime", "guided_check", "final_review"].includes(
        step.id
      )
    )
  );
}
