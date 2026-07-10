/** Reference for all 7 ITR forms — education + product coverage flags. */

export type ItrFormId =
  | "ITR-1"
  | "ITR-2"
  | "ITR-3"
  | "ITR-4"
  | "ITR-5"
  | "ITR-6"
  | "ITR-7";

export type ItrSupportLevel = "guided" | "partner" | "coming_soon";

export interface ItrFormRow {
  form: ItrFormId;
  nickname?: string;
  whoShouldFile: string;
  support: ItrSupportLevel;
  supportLabel: string;
}

export const ITR_FORMS_REFERENCE: readonly ItrFormRow[] = [
  {
    form: "ITR-1",
    nickname: "Sahaj",
    whoShouldFile:
      "Residents with salary/pension, one house, and interest — total income up to ₹50 lakh. No capital gains or business income.",
    support: "guided",
    supportLabel: "Self-file with AI guide",
  },
  {
    form: "ITR-2",
    whoShouldFile:
      "Capital gains (shares, MF, property), foreign income, multiple houses, or income above ₹50 lakh. No business/profession income.",
    support: "guided",
    supportLabel: "Self-file with AI guide",
  },
  {
    form: "ITR-3",
    whoShouldFile:
      "Business or profession income — mandatory for F&O and intraday trading (non-speculative / speculative business income).",
    support: "guided",
    supportLabel: "AI-guided ITR-3 + trading schedules",
  },
  {
    form: "ITR-4",
    nickname: "Sugam",
    whoShouldFile:
      "Presumptive business/profession (44AD / 44ADA) with turnover up to ₹50 lakh — not for active F&O traders.",
    support: "guided",
    supportLabel: "Self-file with AI guide",
  },
  {
    form: "ITR-5",
    whoShouldFile: "Partnership firms, LLPs, AOPs, and BOIs.",
    support: "partner",
    supportLabel: "CA partner filing",
  },
  {
    form: "ITR-6",
    whoShouldFile: "Companies (other than those claiming charitable exemptions).",
    support: "partner",
    supportLabel: "CA partner filing",
  },
  {
    form: "ITR-7",
    whoShouldFile:
      "Trusts, political parties, charitable institutions, and colleges claiming tax exemptions.",
    support: "partner",
    supportLabel: "CA partner filing",
  },
] as const;

export const AI_CA_CONFIDENCE_HEADLINE =
  "Your AI-assisted CA — we pick the right ITR (1–7), read your documents, and walk you through filing.";

export const AI_CA_CONFIDENCE_BODY =
  "Whether you are salaried, sold shares, or trade F&O on Zerodha or Groww — we map your income to the correct form, flag audit risks early, and stay with you until you submit on incometax.gov.in.";

export const FNO_GUIDED_HEADLINE = "F&O needs ITR-3 — we will guide you";

export const FNO_GUIDED_BODY =
  "Options and futures are taxed as business income (not 15% capital gains). We help you import broker P&L, calculate turnover, deduct expenses, and complete the trading schedules in ITR-3.";
