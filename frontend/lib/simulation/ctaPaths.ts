import { HERO_CTAS, FINAL_CTA } from "@/lib/copy/marketing";
import { FORM16_QUICK, ITR_TYPE_QUIZ, suggestItrType, type ItrQuizAnswers } from "@/lib/content/hooks";
import { QUICK_START_CONNECTORS } from "@/lib/constants";
import { getJourneyStep } from "@/lib/filing/journey";
import {
  buildDocumentsFastPathUrl,
  buildEligibilityForm16Url,
  buildParsingForm16Url,
} from "@/lib/filing/routes";

export interface CtaPathEntry {
  id: string;
  label: string;
  href: string;
  source: string;
  expectedJourneyStep?: ReturnType<typeof getJourneyStep>;
  notes?: string;
}

export const MARKETING_CTA_PATHS: CtaPathEntry[] = [
  {
    id: "hero-start-filing",
    label: HERO_CTAS.startFiling.label,
    href: HERO_CTAS.startFiling.href,
    source: "landing-hero",
    expectedJourneyStep: "E",
  },
  {
    id: "hero-upload-form16",
    label: HERO_CTAS.uploadForm16.label,
    href: HERO_CTAS.uploadForm16.href,
    source: "landing-hero",
    expectedJourneyStep: "B",
  },
  {
    id: "hero-how-it-works",
    label: HERO_CTAS.howItWorks.label,
    href: HERO_CTAS.howItWorks.href,
    source: "landing-hero",
    notes: "In-page anchor",
  },
  {
    id: "final-cta-primary",
    label: FINAL_CTA.primary,
    href: HERO_CTAS.startFiling.href,
    source: "FinalCta",
    expectedJourneyStep: "E",
  },
  {
    id: "final-cta-secondary",
    label: FINAL_CTA.secondary,
    href: "/file/start",
    source: "FinalCta",
    expectedJourneyStep: "A",
  },
  {
    id: "form16-quick-yes",
    label: FORM16_QUICK.yes.label,
    href: FORM16_QUICK.yes.href,
    source: "Form16QuickCard",
    expectedJourneyStep: "B",
  },
  {
    id: "form16-quick-no",
    label: FORM16_QUICK.no.label,
    href: FORM16_QUICK.no.href,
    source: "Form16QuickCard",
    expectedJourneyStep: "E", // CONFIRM income tab
  },
  {
    id: "file-welcome-primary",
    label: "Start eligibility",
    href: "/file/start",
    source: "file/page",
    expectedJourneyStep: "A",
  },
  {
    id: "file-welcome-companion",
    label: "Companion mode",
    href: "/file/companion",
    source: "file/page",
    expectedJourneyStep: "F",
  },
  {
    id: "documents-fast-path",
    label: "Form16 fast path",
    href: buildDocumentsFastPathUrl(),
    source: "filing/routes",
    expectedJourneyStep: "B",
  },
  {
    id: "eligibility-form16",
    label: "Form16 eligibility",
    href: buildEligibilityForm16Url("additional-income"),
    source: "filing/routes",
    expectedJourneyStep: "A",
  },
  {
    id: "parsing-form16",
    label: "Form16 parsing",
    href: buildParsingForm16Url(),
    source: "filing/routes",
    expectedJourneyStep: "B",
  },
  ...QUICK_START_CONNECTORS.map((c) => ({
    id: `quickstart-${c.id}`,
    label: c.title,
    href: c.href,
    source: "QuickStart",
    expectedJourneyStep: "B" as const,
  })),
  ...Object.entries(ITR_TYPE_QUIZ.results).map(([key, result]) => ({
    id: `quiz-result-${key}`,
    label: result.form,
    href: result.href,
    source: "ItrTypeQuiz",
    expectedJourneyStep: key === "talkToCa" ? ("A" as const) : undefined,
  })),
];

/** All quiz answer combinations (4×3×3×2×2 = 144). */
export function enumerateQuizAnswerPaths(): Array<{
  answers: ItrQuizAnswers;
  outcome: ReturnType<typeof suggestItrType>;
  href: string;
}> {
  const incomeOpts = ITR_TYPE_QUIZ.questions[0].options.map((o) => o.value);
  const employerOpts = ITR_TYPE_QUIZ.questions[1].options.map((o) => o.value);
  const propertyOpts = ITR_TYPE_QUIZ.questions[2].options.map((o) => o.value);
  const levelOpts = ITR_TYPE_QUIZ.questions[3].options.map((o) => o.value);
  const residencyOpts = ITR_TYPE_QUIZ.questions[4].options.map((o) => o.value);

  const paths: Array<{
    answers: ItrQuizAnswers;
    outcome: ReturnType<typeof suggestItrType>;
    href: string;
  }> = [];

  for (const income of incomeOpts) {
    for (const employers of employerOpts) {
      for (const property of propertyOpts) {
        for (const income_level of levelOpts) {
          for (const residency of residencyOpts) {
            const answers: ItrQuizAnswers = {
              income,
              employers,
              property,
              income_level,
              residency,
            };
            const outcome = suggestItrType(answers);
            paths.push({
              answers,
              outcome,
              href: ITR_TYPE_QUIZ.results[outcome].href,
            });
          }
        }
      }
    }
  }

  return paths;
}

export function resolveCtaRoutePath(href: string): string {
  if (href.startsWith("#")) return "/";
  const url = new URL(href, "http://localhost");
  return url.pathname + url.search;
}

export function ctaPathExists(href: string): boolean {
  const path = resolveCtaRoutePath(href);
  if (path === "/" || path.startsWith("/file") || path.startsWith("/learn")) {
    return true;
  }
  return false;
}
