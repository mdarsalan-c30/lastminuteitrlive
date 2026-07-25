import { NextResponse } from "next/server";
import { runAdvisorAction } from "@/lib/ai/groqAdvisor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  try {
    // Default to localhost:5000 if not provided
    const RAILWAY_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:5000";
    // If it ends with /api/compute, remove it
    let cleanUrl = RAILWAY_URL.replace(/\/+$/, "");
    if (cleanUrl.endsWith("/api/compute")) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - "/api/compute".length);
    }
    const targetUrl = `${cleanUrl}/api/advisor/action`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: AbortSignal.timeout(4_000),
    });
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ ok: false, error: `Invalid proxy response from backend: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    if (res.ok && data?.reply) {
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error) {
    console.error("[proxyToAdvisorAction] Fetch failed:", error);
  }

  try {
    const reply = await runAdvisorAction(JSON.parse(payload));
    return NextResponse.json({ reply, source: "groq-fallback" });
  } catch (error) {
    console.error("[advisorActionFallback] Failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "AI advisor is temporarily unavailable. Please try again shortly." },
      { status: 502 }
    );
  }
}
