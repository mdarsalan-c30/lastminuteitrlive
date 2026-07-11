import { NextRequest, NextResponse } from "next/server";
import {
  loadChatMessages,
  saveChatMessages,
  type ChatMessage,
} from "@/lib/chat-store";
import { answerGenieQuestion } from "@/lib/filing/genieAnswer";
import type { GenieChatContext } from "@/lib/filing/genieContext";

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
      context?: GenieChatContext;
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

    const answer = await answerGenieQuestion(question, body.context);

    // #region agent log
    fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'chat/route.ts:POST',message:'genie answer',data:{source:answer.source,confidence:answer.confidence,hasDocs:!!body.context?.documents,connectors:body.context?.documents?.connectedConnectors??[]},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    const supportMessage: ChatMessage = {
      id: `chat_${Date.now()}_reply`,
      role: "support",
      text: answer.text,
      sessionId: body.sessionId.trim(),
      createdAt: new Date(Date.now() + 1).toISOString(),
    };

    const existing = await loadChatMessages();
    existing.push(userMessage, supportMessage);
    await saveChatMessages(existing);

    return NextResponse.json({
      success: true,
      messages: [userMessage, supportMessage],
      meta: {
        source: answer.source,
        confidence: answer.confidence,
        citations: answer.citations,
      },
    });
  } catch (error) {
    console.error("chat POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
