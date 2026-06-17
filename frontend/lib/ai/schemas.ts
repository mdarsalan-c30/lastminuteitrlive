import { z } from "zod";

/** Shared follow-up question shape (mirrors questionEngine). */
export const followUpQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  whyWeAsk: z.string().min(1),
  category: z.enum([
    "documents",
    "income",
    "deductions",
    "profile",
    "reconciliation",
  ]),
  priority: z.enum(["high", "medium", "low"]),
});

export const escalationSchema = z.enum(["none", "ca_review"]);

export const followUpQuestionsResponseSchema = z.object({
  questions: z.array(followUpQuestionSchema).max(12),
  escalation: escalationSchema.optional().default("none"),
});

export const plainEnglishExplainSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  bulletPoints: z.array(z.string()).max(8).optional().default([]),
  escalation: escalationSchema.optional().default("none"),
  disclaimer: z.string().min(1),
});

export const deductionEligibilitySchema = z.object({
  title: z.string().min(1),
  eligible: z.boolean(),
  explanation: z.string().min(1),
  proofRequired: z.array(z.string()).max(6).optional().default([]),
  escalation: escalationSchema.optional().default("none"),
  disclaimer: z.string().min(1),
});

export const companionGuidanceSchema = z.object({
  title: z.string().min(1),
  stepSummary: z.string().min(1),
  instructions: z.array(z.string()).max(10),
  proofToKeep: z.array(z.string()).max(6).optional().default([]),
  escalation: escalationSchema.optional().default("none"),
  disclaimer: z.string().min(1),
});

export const itrSummaryPayloadSchema = z.object({
  bullets: z.array(z.string()).max(6),
  flags: z
    .array(
      z.object({
        type: z.enum(["warning", "info", "success"]),
        text: z.string(),
      })
    )
    .max(5),
  regimeHint: z.string().nullable(),
  rowInsights: z.record(z.string(), z.string()).optional().default({}),
});

export const draftProfileSchema = z.object({
  assessmentYear: z.string(),
  residentialStatus: z.enum(["resident", "non_resident", "rnor"]),
  ageBand: z.enum(["under_60", "senior", "super_senior"]),
});

export const draftIncomeSchema = z.object({
  grossSalary: z.number(),
  tds: z.number(),
  fdInterest: z.number(),
  employer: z.string(),
  advanceTax: z.number(),
  selfAssessmentTax: z.number(),
  hraReceived: z.number(),
  actualRentPaid: z.number(),
  cityTier: z.enum(["metro", "non_metro"]),
});

export const draftHousePropertySchema = z.object({
  propertyType: z.enum(["none", "self_occupied", "let_out"]),
  annualRent: z.number(),
  homeLoanInterest: z.number(),
  municipalTax: z.number(),
  coOwnerPercent: z.number(),
});

export const draftDeductionsSchema = z.object({
  section80C: z.number(),
  section80D: z.number(),
  section80GG: z.number(),
  npsExtra: z.number(),
});

export const draftSliceSchema = z.object({
  profile: draftProfileSchema,
  income: draftIncomeSchema,
  incomeChips: z.array(z.string()),
  connectedConnectors: z.array(z.string()),
  mismatchResolved: z.boolean(),
  lastParseResult: z
    .object({
      connectorId: z.string(),
      mode: z.enum(["extracted", "demo_fallback"]),
      fieldConfidence: z.record(z.string(), z.enum(["high", "review", "missing"])),
      warnings: z.array(z.string()),
      demo: z.boolean(),
      filename: z.string().optional(),
      filenames: z.array(z.string()).optional(),
      parsedParts: z
        .array(z.object({ name: z.string(), partKind: z.string() }))
        .optional(),
      parsedAt: z.string().optional(),
    })
    .nullable(),
  houseProperty: draftHousePropertySchema,
  deductions: draftDeductionsSchema,
});

export const aiQuestionsRequestSchema = z.object({
  draft: draftSliceSchema,
  result: z.unknown().optional().nullable(),
  questionAnswers: z.record(z.string(), z.unknown()).optional(),
});

export const aiExplainRequestSchema = z.object({
  type: z.enum(["regime", "deduction", "companion"]),
  context: z.record(z.string(), z.unknown()),
});

export type FollowUpQuestionOutput = z.infer<typeof followUpQuestionSchema>;
export type FollowUpQuestionsResponse = z.infer<
  typeof followUpQuestionsResponseSchema
>;
export type PlainEnglishExplainOutput = z.infer<typeof plainEnglishExplainSchema>;
export type DeductionEligibilityOutput = z.infer<typeof deductionEligibilitySchema>;
export type CompanionGuidanceOutput = z.infer<typeof companionGuidanceSchema>;
export type ItrSummaryPayloadOutput = z.infer<typeof itrSummaryPayloadSchema>;
export type AiQuestionsRequest = z.infer<typeof aiQuestionsRequestSchema>;
export type AiExplainRequest = z.infer<typeof aiExplainRequestSchema>;
