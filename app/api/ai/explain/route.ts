import { NextRequest, NextResponse } from "next/server";
import { buildExplainFallback } from "@/lib/ai/explainFallback";
import { completeJson, isAnyLlmConfigured } from "@/lib/ai/llmService";
import { buildCompanionGuidancePrompt } from "@/lib/ai/prompts/companionGuidance";
import { buildDeductionEligibilityPrompt } from "@/lib/ai/prompts/deductionEligibility";
import { buildPlainEnglishExplainPrompt } from "@/lib/ai/prompts/plainEnglishExplain";
import {
  aiExplainRequestSchema,
  companionGuidanceSchema,
  deductionEligibilitySchema,
  plainEnglishExplainSchema,
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiExplainRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const fallbackExplain = buildExplainFallback(parsed.data);

    if (!isAnyLlmConfigured()) {
      return NextResponse.json({
        explain: fallbackExplain,
        source: "rules",
        fallback: true,
        message: "AI not configured — showing rule-based explanation.",
      });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (parsed.data.type === "companion") {
      const { systemPrompt, userPrompt } = buildCompanionGuidancePrompt(
        parsed.data.context as Parameters<typeof buildCompanionGuidancePrompt>[0]
      );
      const llmResult = await completeJson({
        schema: companionGuidanceSchema,
        systemPrompt,
        userPrompt,
        routeKey: "ai-explain-companion",
        clientIp: ip,
      });

      if (llmResult.ok) {
        return NextResponse.json({
          explain: {
            title: llmResult.data.title,
            explanation: llmResult.data.stepSummary,
            bulletPoints: llmResult.data.instructions,
            escalation: llmResult.data.escalation,
            disclaimer: llmResult.data.disclaimer,
          },
          source: "llm",
          fallback: false,
        });
      }

      return NextResponse.json({
        explain: fallbackExplain,
        source: "rules",
        fallback: true,
        message: llmResult.error,
      });
    }

    if (parsed.data.type === "deduction") {
      const ctx = parsed.data.context;
      const { systemPrompt, userPrompt } = buildDeductionEligibilityPrompt({
        section: String(ctx.section ?? "Deduction"),
        claimedAmount:
          typeof ctx.claimedAmount === "number" ? ctx.claimedAmount : undefined,
        cap: typeof ctx.cap === "number" ? ctx.cap : undefined,
        regime: typeof ctx.regime === "string" ? ctx.regime : undefined,
        proofHints: Array.isArray(ctx.proofRequired)
          ? (ctx.proofRequired as string[])
          : undefined,
        extra: ctx,
      });

      const llmResult = await completeJson({
        schema: deductionEligibilitySchema,
        systemPrompt,
        userPrompt,
        routeKey: "ai-explain-deduction",
        clientIp: ip,
      });

      if (llmResult.ok) {
        const proof = llmResult.data.proofRequired ?? [];
        return NextResponse.json({
          explain: {
            title: llmResult.data.title,
            explanation: llmResult.data.explanation,
            bulletPoints: [
              llmResult.data.eligible
                ? "This deduction may be claimable with valid proof."
                : "This deduction may not apply to your current inputs.",
              ...proof,
            ],
            escalation: llmResult.data.escalation,
            disclaimer: llmResult.data.disclaimer,
          },
          source: "llm",
          fallback: false,
        });
      }

      return NextResponse.json({
        explain: fallbackExplain,
        source: "rules",
        fallback: true,
        message: llmResult.error,
      });
    }

    const { systemPrompt, userPrompt } = buildPlainEnglishExplainPrompt({
      explainType: "regime",
      payload: parsed.data.context,
    });

    const llmResult = await completeJson({
      schema: plainEnglishExplainSchema,
      systemPrompt,
      userPrompt,
      routeKey: "ai-explain-regime",
      clientIp: ip,
    });

    if (llmResult.ok) {
      return NextResponse.json({
        explain: llmResult.data,
        source: "llm",
        fallback: false,
      });
    }

    return NextResponse.json({
      explain: fallbackExplain,
      source: "rules",
      fallback: true,
      message: llmResult.error,
    });
  } catch (error) {
    console.error("ai/explain error:", error);
    return NextResponse.json(
      {
        explain: buildExplainFallback({
          type: "regime",
          context: {},
        }),
        source: "rules",
        fallback: true,
        message: "Explain generation failed",
      },
      { status: 200 }
    );
  }
}
