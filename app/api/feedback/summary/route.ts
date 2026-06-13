import { NextResponse } from "next/server";
import { getApprovedFeedback, getFeedbackSummary } from "@/lib/feedback";

export async function GET() {
  const summary = await getFeedbackSummary();
  const recent = (await getApprovedFeedback()).slice(0, 6);
  return NextResponse.json({ ...summary, recent });
}
