import { NextRequest, NextResponse } from "next/server";
import {
  getApprovedFeedback,
  getFeedbackSummary,
  loadFeedback,
  saveFeedback,
  type FeedbackEntry,
} from "@/lib/feedback";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      rating?: number;
      screen?: string;
      email?: string;
    };

    const rating = body.rating;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating (1–5) is required" },
        { status: 400 }
      );
    }

    const message = body.message?.trim() ?? "";
    if (rating < 3 && !message) {
      return NextResponse.json(
        { error: "Please tell us what went wrong (required for ratings below 3)" },
        { status: 400 }
      );
    }

    if (message.length > 280) {
      return NextResponse.json(
        { error: "Message must be 280 characters or fewer" },
        { status: 400 }
      );
    }

    const entry: FeedbackEntry = {
      id: `fb_${Date.now()}`,
      message,
      rating,
      screen: body.screen,
      email: body.email?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const existing = await loadFeedback();
    existing.push(entry);
    await saveFeedback(existing);

    return NextResponse.json({
      success: true,
      id: entry.id,
      public: rating >= 3,
    });
  } catch (error) {
    console.error("feedback error:", error);
    return NextResponse.json(
      { error: "Failed to store feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const approved = await getApprovedFeedback();
  const summary = await getFeedbackSummary();
  return NextResponse.json({
    ...summary,
    entries: approved.map((e) => ({
      id: e.id,
      rating: e.rating,
      message: e.message,
      screen: e.screen,
      createdAt: e.createdAt,
    })),
  });
}
