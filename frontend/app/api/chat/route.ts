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

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      role: "user",
      text: body.text.trim().slice(0, 2000),
      sessionId: body.sessionId.trim(),
      createdAt: now,
    };

    const supportMessage: ChatMessage = {
      id: `chat_${Date.now()}_reply`,
      role: "support",
      text: SUPPORT_REPLY,
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
