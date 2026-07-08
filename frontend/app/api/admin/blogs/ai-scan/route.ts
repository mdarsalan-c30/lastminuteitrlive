import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Strip HTML for the scan
    const plainText = content.replace(/<[^>]*>/g, '').trim();

    const apiKey = process.env.ZEROGPT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ZeroGPT API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.zerogpt.com/api/detect/detectText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ApiKey": apiKey
      },
      body: JSON.stringify({
        input_text: plainText
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ZeroGPT HTTP Error:", errText);
      return NextResponse.json({ error: "Failed to scan content with AI detector" }, { status: response.status });
    }

    const data = await response.json();
    
    // ZeroGPT sometimes returns 200 OK but success: false (e.g. out of credits)
    if (data && data.success === false) {
       console.error("ZeroGPT API Error:", data.message);
       return NextResponse.json({ error: data.message || "Failed to scan content" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("AI Scan Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
