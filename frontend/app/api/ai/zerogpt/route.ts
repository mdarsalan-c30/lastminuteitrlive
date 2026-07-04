import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.ZEROGPT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI detection is not configured" },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.zerogpt.com/api/detect/detectText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ApiKey: apiKey,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ZeroGPT API Error:", err);
      return NextResponse.json(
        { error: "Failed to detect AI content" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      aiScore: data.data?.fakePercentage || data.fakePercentage || 0,
      feedback: data.data || data,
    });
  } catch (error: unknown) {
    console.error("ZeroGPT exception:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
