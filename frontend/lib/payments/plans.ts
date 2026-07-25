import type { PlanId } from "@/lib/filing/types";

export type { PlanId };

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  originalPrice?: number;
  priceLabel: string;
  description: string;
  subtitle?: string;
  subtext?: string;
  features: string[];
  recommended?: boolean;
  comingSoon?: boolean;
  comingSoonFeatures?: string[];
  buttonText?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Basic",
    price: 0,
    priceLabel: "₹0",
    description: "Estimates, checklists, and the free screen-by-screen portal guide.",
    features: [
      "Tax estimate",
      "ITR form recommendation",
      "Free portal guide (exact values unlock after payment)",
    ],
  },
  normal: {
    id: "normal",
    name: "Essential",
    price: 349,
    priceLabel: "₹349",
    description: "For salaried filers who want guided checks and a portal filing companion.",
    recommended: false,
    buttonText: "Choose Essential",
    features: [
      "Form 16 upload & review",
      "Old vs new regime comparison",
      "Mismatch checklist",
      "Portal filing companion guide",
    ],
  },
  pro: {
    id: "pro",
    name: "Guided",
    price: 599,
    priceLabel: "₹599",
    description:
      "Additional guided checks and priority support for more involved filing situations.",
    recommended: true,
    buttonText: "Choose Guided",
    features: [
      "Everything in Essential",
      "Personalised filing guidance",
      "Priority mismatch review",
      "Capital gains & F&O alerts",
      "Regime recommendation on your draft",
      "Priority support",
    ],
  },
  b2b_20: {
    id: "b2b_20",
    name: "20 Applications",
    price: 4999,
    originalPrice: 7180,
    priceLabel: "₹4,999",
    description: "For CAs & HRs. 20 filing credits.",
    features: ["Assign filings to clients", "Credit wallet", "Bulk dashboard"],
  },
  b2b_40: {
    id: "b2b_40",
    name: "40 Applications",
    price: 8999,
    originalPrice: 14360,
    priceLabel: "₹8,999",
    description: "For CAs & HRs. 40 filing credits.",
    features: ["Assign filings to clients", "Credit wallet", "Bulk dashboard"],
  },
  b2b_100: {
    id: "b2b_100",
    name: "100 Applications",
    price: 16999,
    originalPrice: 35900,
    priceLabel: "₹16,999",
    description: "For CAs & HRs. 100 filing credits.",
    features: ["Assign filings to clients", "Credit wallet", "Bulk dashboard"],
  },
  diy: {
    id: "diy",
    name: "Essential (Legacy)",
    price: 349,
    priceLabel: "₹349",
    description: "Legacy plan id — maps to Essential pricing.",
    features: [],
  },
  ai_smart: {
    id: "ai_smart",
    name: "Guided (Legacy)",
    price: 599,
    priceLabel: "₹599",
    description: "Legacy plan id — maps to Guided pricing.",
    features: [],
  },
  ca: {
    id: "ca",
    name: "CA Review",
    price: 2499,
    priceLabel: "₹2,499",
    description: "Optional human CA review before you file.",
    comingSoon: true,
    features: [
      "Everything in Guided",
      "CA review of your draft",
      "Notice-risk walkthrough",
    ],
  },
};

/** Plans shown on marketing + checkout. */
export const PLAN_LIST: Plan[] = [PLANS.normal, PLANS.pro];

/** Plans the payment APIs accept (consumer checkout). CA is blocked until live. */
export const CHECKOUT_PLAN_IDS: PlanId[] = [
  "free",
  "normal",
  "pro",
  "diy",
  "ai_smart",
];

export const B2B_CHECKOUT_PLAN_IDS: PlanId[] = ["b2b_20", "b2b_40", "b2b_100"];

/** True when a plan may be purchased via create-order / verify (B2C checkout). */
export function isPurchasablePlanId(id: PlanId): boolean {
  const plan = PLANS[id];
  if (!plan) return false;
  if (plan.comingSoon) return false;
  return (CHECKOUT_PLAN_IDS as string[]).includes(id);
}

/** B2B bulk packs — CA session only. */
export function isCaPurchasablePlanId(id: PlanId): boolean {
  const plan = PLANS[id];
  if (!plan) return false;
  return (B2B_CHECKOUT_PLAN_IDS as string[]).includes(id);
}

/** Admin-editable pricing rows. */
export const ADMIN_PRICING_PLAN_IDS: PlanId[] = [
  "free",
  "normal",
  "pro",
  "diy",
  "ai_smart",
  "ca",
];

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

export function isCheckoutPlanId(id: string): id is PlanId {
  return (CHECKOUT_PLAN_IDS as string[]).includes(id);
}

/** Map legacy aliases to current catalog ids. CA / ca_review are not purchasable. */
export function normalizePlanId(raw: string | undefined): PlanId | null {
  if (!raw) return null;
  const id = raw === "ca_review" ? "ca" : raw;
  if (isCheckoutPlanId(id) || (B2B_CHECKOUT_PLAN_IDS as string[]).includes(id)) {
    return id as PlanId;
  }
  return null;
}
