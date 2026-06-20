"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "support";
  text: string;
  createdAt: string;
}

const SESSION_KEY = "lastminute-itr-chat-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (sid: string) => {
    const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sid)}`);
    if (res.ok) {
      const data = (await res.json()) as { messages: ChatMessage[] };
      setMessages(data.messages);
    }
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    loadMessages(sid);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !sessionId || loading) return;
    setLoading(true);
    const outgoing = text.trim();
    setText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: outgoing, sessionId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { messages: ChatMessage[] };
      setMessages((prev) => [...prev, ...data.messages]);
    } catch {
      setText(outgoing);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-3 shrink-0 text-center sm:mb-4">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-blue-100 text-primary">
            <MessageCircle className="size-5" />
          </div>
          <h1 className="text-xl font-bold">Support chat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask a filing question — we respond within 1–2 business days. You file on{" "}
            <a
              href="https://www.incometax.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              incometax.gov.in
            </a>
            .
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-muted/20 p-3 sm:p-4">
          {initialLoad ? (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Ask about Form 16, AIS mismatches, regime choice, or companion
              filing.
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[min(85%,20rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-foreground"
                    )}
                  >
                    {msg.role === "support" && (
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        Support
                      </p>
                    )}
                    {msg.text}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-3 flex shrink-0 gap-2 sm:mt-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your question…"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            maxLength={2000}
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="size-12 shrink-0 rounded-xl"
            disabled={loading || !text.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
