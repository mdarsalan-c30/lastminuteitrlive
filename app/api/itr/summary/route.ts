import { NextRequest, NextResponse } from "next/server";
import { generateItrSummary } from "@/lib/ai/generateItrSummary";
import type { ItrSummaryRequest } from "@/lib/itr/summaryTypes";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ItrSummaryRequest;

    if (!body.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        { error: "rows array is required" },
        { status: 400 }
      );
    }

    const { summary, aiEnabled } = await generateItrSummary(body);

    return NextResponse.json({
      summary,
      aiEnabled,
      fallback: !summary,
      message: !aiEnabled
        ? "AI summary unavailable — set AI_API_KEY on the server."
        : summary
          ? undefined
          : "Could not generate AI summary — showing parsed data only.",
    });
  } catch (error) {
    console.error("itr/summary error:", error);
    return NextResponse.json(
      {
        summary: null,
        aiEnabled: Boolean(process.env.AI_API_KEY?.trim()),
        fallback: true,
        message: "Summary generation failed",
      },
      { status: 500 }
    );
  }
}
