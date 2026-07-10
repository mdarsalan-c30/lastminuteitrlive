import type { PlanId } from "@/lib/filing/types";

export type { PlanId };

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  originalPrice?: number;
  priceLabel: string;
  description: string;
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
    name: "Starter",
    price: 349,
    originalPrice: 999,
    priceLabel: "₹349",
    description: "For simple salaried filers who want AI-guided checks and a portal companion.",
    recommended: false,
    buttonText: "Get Starter",
    features: [
      "Form 16 upload & review",
      "Old vs new regime comparison",
      "Mismatch checklist",
      "Portal filing companion guide",
    ],
  },
  pro: {
    id: "pro",
    name: "AI Smart",
    price: 599,
    originalPrice: 1999,
    priceLabel: "₹599",
    description:
      "Deeper AI checks, priority companion guidance, and capital-gains alerts for complex salaried cases.",
    recommended: true,
    buttonText: "Get AI Smart",
    features: [
      "Everything in Starter",
      "Personalised AI tax companion",
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
    name: "Starter (Legacy)",
    price: 349,
    priceLabel: "₹349",
    description: "Legacy plan id — maps to Starter pricing.",
    features: [],
  },
  ai_smart: {
    id: "ai_smart",
    name: "AI Smart (Legacy)",
    price: 599,
    priceLabel: "₹599",
    description: "Legacy plan id — maps to AI Smart pricing.",
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
      "Everything in AI Smart",
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

/** True when a plan may be purchased via create-order / verify. */
export function isPurchasablePlanId(id: PlanId): boolean {
  const plan = PLANS[id];
  if (!plan) return false;
  if (plan.comingSoon) return false;
  return (CHECKOUT_PLAN_IDS as string[]).includes(id);
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
  if (!isCheckoutPlanId(id)) return null;
  return id as PlanId;
}
