import { NextRequest, NextResponse } from "next/server";
import {
  loadChatMessages,
  saveChatMessages,
  type ChatMessage,
} from "@/lib/chat-store";

const SUPPORT_REPLY =
  "Thanks for reaching out. Our team will review your message and respond by email within 1–2 business days. For urgent filing help, continue with your companion guide on incometax.gov.in.";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const all = await loadChatMessages();
  const messages = all
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ messages });
}

async function callGemini(question: string): Promise<string> {
  const apiKey = "AIzaSyCezi2i9eAreTivaji9GFS15DM4HNhTRQo";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are LastMinuteITR Genie, a helpful, friendly, and expert Indian Tax Filing AI Assistant.
The user is currently filing their ITR for AY 2026-27 (FY 2025-26) on the LastMinuteITR MVP app.
Answer the following tax query in plain, simple English. Keep it concise, professional, and easy to understand (1-3 sentences).
Do not use complicated legal jargon. Highlight key limits if applicable (e.g., Standard Deduction ₹75k in New Regime, HRA in Old Regime, Section 80C cap of ₹1.5L, 80D limits, NPS extra ₹50k, etc.).

User Query: ${question}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini status: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || SUPPORT_REPLY
    );
  } catch (error) {
    console.error("Gemini API call failed, falling back to static reply:", error);
    return SUPPORT_REPLY;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      sessionId?: string;
    };

    if (!body.text?.trim() || !body.sessionId?.trim()) {
      return NextResponse.json(
        { error: "text and sessionId are required" },
        { status: 400 }
      );
    }

    const question = body.text.trim();
    const now = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      role: "user",
      text: question.slice(0, 2000),
      sessionId: body.sessionId.trim(),
      createdAt: now,
    };

    const aiReply = await callGemini(question);

    const supportMessage: ChatMessage = {
      id: `chat_${Date.now()}_reply`,
      role: "support",
      text: aiReply,
      sessionId: body.sessionId.trim(),
      createdAt: new Date(Date.now() + 1).toISOString(),
    };

    const existing = await loadChatMessages();
    existing.push(userMessage, supportMessage);
    await saveChatMessages(existing);

    return NextResponse.json({
      success: true,
      messages: [userMessage, supportMessage],
    });
  } catch (error) {
    console.error("chat POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
