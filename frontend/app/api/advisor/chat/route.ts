import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    // Default to localhost:5000 if not provided
    const RAILWAY_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:5000";
    // If it ends with /api/compute, remove it
    let cleanUrl = RAILWAY_URL.replace(/\/+$/, "");
    if (cleanUrl.endsWith("/api/compute")) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - "/api/compute".length);
    }
    const targetUrl = `${cleanUrl}/api/advisor/chat`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ ok: false, error: `Invalid proxy response from backend: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[proxyToAdvisorChat] Fetch failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to reach AI advisor engine" }, { status: 502 });
  }
}
