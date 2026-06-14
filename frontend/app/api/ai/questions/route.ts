import { NextRequest, NextResponse } from "next/server";
import type { AgeBand, BusinessType, IncomeBand } from "@/lib/filing/case-matrix";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import type { ITRResult } from "@/lib/engine/types";
import { generateRuleBasedQuestions } from "@/lib/ai/fallbackQuestionRules";
import { completeJson, isAnyLlmConfigured } from "@/lib/ai/llmService";
import { buildFollowUpQuestionsPrompt } from "@/lib/ai/prompts/followUpQuestions";
import { shouldEscalateToCaReview } from "@/lib/ai/outputValidator";
import {
  aiQuestionsRequestSchema,
  followUpQuestionsResponseSchema,
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

function isItrResult(value: unknown): value is ITRResult {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.assessment_year === "string" && "confidence" in obj;
}

function summarizeDraft(draft: ReturnType<typeof aiQuestionsRequestSchema.parse>["draft"]) {
  return {
    incomeChips: draft.incomeChips,
    grossSalary: draft.income.grossSalary,
    connectors: draft.connectedConnectors,
    ageBand: draft.profile.ageBand,
    deductions: draft.deductions,
    mismatchResolved: draft.mismatchResolved,
  };
}

function summarizeCompute(result: ITRResult | null | undefined) {
  if (!result) return null;
  return {
    itrForm: result.profile.itr_form,
    filingReady: result.confidence.filing_ready,
    completeness: result.confidence.completeness_score,
    caEscalation: result.confidence.ca_escalation_recommended,
    caReasons: result.confidence.ca_escalation_reasons,
    recommendedRegime: result.regime_comparison?.recommended_regime,
    riskCount: result.risk_flags?.length ?? 0,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiQuestionsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { draft, questionAnswers } = parsed.data;
    const result = isItrResult(parsed.data.result)
      ? parsed.data.result
      : null;

    const userInput = draftToUserInput({
      filingMode: "estimate",
      profile: draft.profile,
      matrix: {
        income: "2" as IncomeBand,
        age: "a" as AgeBand,
        business: "x" as BusinessType,
      },
      incomeChips: draft.incomeChips,
      income: draft.income,
      houseProperty: draft.houseProperty,
      deductions: draft.deductions,
      connectedConnectors: draft.connectedConnectors,
    });

    const ruleQuestions = generateRuleBasedQuestions({
      draft,
      userInput,
      result,
      questionAnswers,
    });

    let llmUsed = false;
    let merged = [...ruleQuestions];
    let escalation: "none" | "ca_review" =
      result && shouldEscalateToCaReview({
        caEscalationRecommended: result.confidence.ca_escalation_recommended,
        expertRequired: result.profile.expert_required,
      })
        ? "ca_review"
        : "none";

    if (isAnyLlmConfigured()) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const { systemPrompt, userPrompt } = buildFollowUpQuestionsPrompt({
        draftSummary: summarizeDraft(draft),
        computeSummary: summarizeCompute(result),
        existingQuestionIds: ruleQuestions.map((q) => q.id),
      });

      const llmResult = await completeJson({
        schema: followUpQuestionsResponseSchema,
        systemPrompt,
        userPrompt,
        routeKey: "ai-questions",
        clientIp: ip,
      });

      if (llmResult.ok) {
        llmUsed = true;
        const seen = new Set(merged.map((q) => q.id));
        for (const q of llmResult.data.questions) {
          if (seen.has(q.id)) continue;
          seen.add(q.id);
          merged.push(q);
        }
        if (llmResult.data.escalation === "ca_review") {
          escalation = "ca_review";
        }
      }
    }

    merged = merged
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      })
      .slice(0, 15);

    return NextResponse.json({
      questions: merged,
      source: llmUsed ? "rules+llm" : "rules",
      llmUsed,
      fallback: !llmUsed,
      escalation,
      message: llmUsed
        ? undefined
        : isAnyLlmConfigured()
          ? "LLM unavailable — showing rule-based questions only."
          : "AI not configured — rule-based questions only.",
    });
  } catch (error) {
    console.error("ai/questions error:", error);
    return NextResponse.json(
      {
        questions: [],
        source: "rules",
        llmUsed: false,
        fallback: true,
        escalation: "none" as const,
        message: "Could not generate questions",
      },
      { status: 200 }
    );
  }
}
