import { NextRequest, NextResponse } from "next/server";
import { appendSessionLog, type SessionLogEvent } from "@/lib/sessionLog";

const VALID_EVENTS: SessionLogEvent[] = [
  "session_start",
  "draft_snapshot",
  "compute_complete",
  "companion_open",
  "presubmit_green",
  "page_leave",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      event?: string;
      path?: string;
      draft?: Record<string, unknown>;
      computeResult?: Record<string, unknown> | null;
      meta?: Record<string, unknown>;
    };

    if (!body.sessionId || typeof body.sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!body.event || !VALID_EVENTS.includes(body.event as SessionLogEvent)) {
      return NextResponse.json(
        { error: `event must be one of: ${VALID_EVENTS.join(", ")}` },
        { status: 400 }
      );
    }

    const entry = await appendSessionLog({
      sessionId: body.sessionId,
      event: body.event as SessionLogEvent,
      path: body.path,
      draft: body.draft,
      computeResult: body.computeResult ?? null,
      meta: body.meta,
    });

    return NextResponse.json({ ok: true, id: entry.id, timestamp: entry.timestamp });
  } catch (error) {
    console.error("session log error:", error);
    return NextResponse.json({ error: "Failed to store session log" }, { status: 500 });
  }
}
