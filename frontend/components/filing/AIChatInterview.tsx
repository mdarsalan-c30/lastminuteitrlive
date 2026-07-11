"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDraftStore } from "@/lib/store/draft";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIChatInterview() {
  const draft = useDraftStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am your AI Smart CA. I'm reviewing your tax profile. To ensure we don't miss any deductions, could you tell me if you switched jobs this year or sold any mutual funds?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // In production, you would point this to your backend route
      // We are pointing to the FastAPI backend
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/advisor/chat`
          : "/api/advisor/chat", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              salary: draft.income?.grossSalary || 0,
              regime: "new",
            },
          }),
        }
      );

      const json = await res.json();
      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      } else {
        const errorMsg = json.error || "Sorry, I am having trouble connecting to my brain right now. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to the AI CA." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (loading) return;
    setLoading(true);
    
    // add user message
    let label = "";
    if (action === "optimize") label = "Find Tax Savings";
    if (action === "anomalies") label = "Scan for Mistakes";
    if (action === "explain") label = "Explain My Taxes";
    setMessages((prev) => [...prev, { role: "user", content: label }]);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/advisor/action`
          : "/api/advisor/action", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            context: {
              salary: draft.income?.grossSalary || 0,
              regime: "new",
              deductions: draft.deductions || {},
            },
          }),
        }
      );

      const json = await res.json();
      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      } else {
        const errorMsg = json.error || "Error performing action.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error performing action." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-slate-50/50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-full text-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold text-slate-800 text-sm leading-none">Smart CA Advisory</h3>
            <p className="text-[11px] text-slate-500 mt-1">I help you find missed deductions</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => handleAction('optimize')} disabled={loading} className="text-xs h-7 px-2">Find Tax Savings</Button>
          <Button variant="outline" size="sm" onClick={() => handleAction('anomalies')} disabled={loading} className="text-xs h-7 px-2">Scan for Mistakes</Button>
          <Button variant="outline" size="sm" onClick={() => handleAction('explain')} disabled={loading} className="text-xs h-7 px-2">Explain My Taxes</Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 text-sm",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  msg.role === "user"
                    ? "bg-slate-800 text-white"
                    : "bg-primary/10 text-primary"
                )}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl max-w-[85%] prose prose-sm prose-slate leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-primary/5 text-slate-800 rounded-tl-sm border border-primary/10"
                )}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown
                    components={{
                      strong: ({node, ...props}) => <span className="font-semibold text-primary" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="marker:text-primary/70" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-sm border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-border bg-white flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
