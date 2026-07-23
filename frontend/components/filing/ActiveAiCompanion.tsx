"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { getBrowserSessionId } from "@/lib/store/sessionInit";
import { getActiveProfileId } from "@/lib/family/client";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  FIELD_GUIDANCE,
  buildWelcomeMessage,
  stepFromPathname,
  suggestedQuestionsForStep,
} from "@/lib/filing/genieKnowledge";
import type { GenieChatContext } from "@/lib/filing/genieContext";
import { buildGenieDocumentSnapshot } from "@/lib/filing/genieDocumentContext";
import { Sparkles, MessageSquare, Send, Lightbulb } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export { FIELD_GUIDANCE };

export function ActiveAiCompanion() {
  const pathname = usePathname();
  const activeField = useDraftStore((s) => s.activeField);
  const income = useDraftStore((s) => s.income);
  const deductions = useDraftStore((s) => s.deductions);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const lastParseResult = useDraftStore((s) => s.lastParseResult);
  const aisFigures = useDraftStore((s) => s.aisFigures);
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const documentFacts = useDraftStore((s) => s.documentFacts);
  const regime = useDraftStore((s) => s.regime);
  const recommendedForm = useDraftStore((s) => s.recommendedForm);
  const name = useDraftStore((s) => s.name);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastStepRef = useRef<string>("");

  const currentStep = stepFromPathname(pathname);
  const { handoff, result } = useDraftTaxCompute({ readOnly: true });

  const netPayable = useMemo(() => {
    if (!result?.regime_comparison) return undefined;
    const rec = result.regime_comparison.recommended_regime;
    return result.regime_comparison[rec]?.net_payable;
  }, [result]);

  const genieContext = useMemo((): GenieChatContext => {
    const rc = result?.regime_comparison;
    const rec = rc?.recommended_regime;
    const slab = rec && rc ? rc[rec] : null;
    const payable = slab?.net_payable;

    const documents = buildGenieDocumentSnapshot({
      connectedConnectors,
      income,
      deductions,
      lastParseResult,
      aisFigures,
      capitalGains,
      documentFacts,
    });

    return {
      step: currentStep,
      recommendedForm: recommendedForm ?? result?.profile?.itr_form ?? undefined,
      regime: regime ?? rec,
      recommendedRegime: rec,
      grossSalary: income.grossSalary > 0 ? income.grossSalary : undefined,
      netPayable: payable,
      taxableIncome: slab?.taxable_income,
      taxSaving: rc?.tax_saving,
      isRefund: payable != null && payable < 0,
      activeField: activeField ?? undefined,
      filingFor: name || undefined,
      completenessScore: result?.confidence?.completeness_score,
      filingReady: result?.confidence?.filing_ready,
      missingDocuments: result?.confidence?.missing_documents,
      mismatchResolved,
      incomeTypes: incomeChips.length ? [...incomeChips] : undefined,
      deductions: {
        section80C: deductions.section80C || undefined,
        section80D: deductions.section80D || undefined,
        hraReceived: income.hraReceived || undefined,
        npsExtra: deductions.npsExtra || undefined,
      },
      riskFlags: result?.risk_flags?.map((r) => r.message).slice(0, 5),
      recommendations: result?.recommendations?.map((r) => r.plain_english).slice(0, 5),
      documents,
    };
  }, [
    activeField,
    aisFigures,
    capitalGains,
    connectedConnectors,
    currentStep,
    deductions,
    documentFacts,
    income,
    incomeChips,
    lastParseResult,
    mismatchResolved,
    name,
    regime,
    recommendedForm,
    result,
  ]);

  // Welcome message on step change — include active field when present
  useEffect(() => {
    if (lastStepRef.current === currentStep && messages.length > 0 && !activeField) return;
    lastStepRef.current = currentStep;
    setMessages([
      {
        id: `welcome_${currentStep}`,
        role: "assistant",
        text: buildWelcomeMessage(currentStep, activeField),
      },
    ]);
  }, [currentStep, activeField]); // eslint-disable-line react-hooks/exhaustive-deps

  // Append field hint when user focuses a field (don't wipe chat)
  useEffect(() => {
    if (!activeField || !FIELD_GUIDANCE[activeField]) return;
    const f = FIELD_GUIDANCE[activeField];
    const hint = `You're now on: ${f.title}\n\n• ${f.tip}\n\n• Tax impact: ${f.impact}`;
    setMessages((prev) => {
      if (prev.some((m) => m.id === `field_${activeField}`)) return prev;
      return [
        ...prev,
        { id: `field_${activeField}`, role: "assistant", text: hint },
      ];
    });
  }, [activeField]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedQuestions = useMemo(() => {
    const base = suggestedQuestionsForStep(currentStep);
    if (connectedConnectors.includes("form16")) {
      return ["What's in my Form 16?", ...base.filter((q) => !q.includes("Form 16"))].slice(0, 4);
    }
    if (connectedConnectors.includes("cams") || capitalGains) {
      return ["Summarize my CAMS upload", ...base].slice(0, 4);
    }
    if (currentStep === "import" && connectedConnectors.length === 0) {
      return ["What documents should I upload?", ...base].slice(0, 4);
    }
    return base;
  }, [capitalGains, connectedConnectors, currentStep]);

  const handleSendQuestion = useCallback(
    async (question: string) => {
      if (!question.trim() || loading) return;

      const userMsg: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        text: question.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setLoading(true);

      const normalized = question.toLowerCase().trim();

      if (normalized === "get expert ca advice") {
        if (!handoff) {
          setMessages((prev) => [
            ...prev,
            {
              id: `genie_${Date.now()}`,
              role: "assistant",
              text:
                "• Fill in your income details first on the Review screen\n• Then ask again — I'll analyse your draft\n• Or go to Regime to run the tax engine",
            },
          ]);
          setLoading(false);
          return;
        }
        try {
          const res = await fetch("/api/layer2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(handoff),
          });
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              id: `genie_${Date.now()}`,
              role: "assistant",
              text: data.advice || "No advice returned.",
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: `genie_${Date.now()}`,
              role: "assistant",
              text: "• CA advice is temporarily unavailable\n• Try again in a minute\n• Your draft is saved",
            },
          ]);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        // #region agent log
        fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'ActiveAiCompanion.tsx:send',message:'chat request context',data:{connectors:genieContext.documents?.connectedConnectors??[],grossSalary:genieContext.documents?.form16?.grossSalary??null,question:question.trim().slice(0,80)},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: question,
            sessionId: getBrowserSessionId(),
            context: {
              ...genieContext,
              profileId: getActiveProfileId(),
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const responseText =
            data.messages?.[data.messages.length - 1]?.text ??
            "• Checking that for you…";
          setMessages((prev) => [
            ...prev,
            { id: `genie_${Date.now()}`, role: "assistant", text: responseText },
          ]);
        } else {
          throw new Error("chat failed");
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `genie_${Date.now()}`,
            role: "assistant",
            text:
              "• Network issue — try again\n• Common tips: 80C max ₹1.5L, gross salary is Form 16 Box 17(1)\n• Use Refresh in the header if your numbers look wrong",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [genieContext, handoff, loading]
  );

  const currentFieldGuidance = activeField ? FIELD_GUIDANCE[activeField] : null;

  return (
    <div className="flex flex-col h-full bg-slate-50/20 border-l border-slate-100/80">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <div className="relative shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white">
            <BrandLogo size="xs" variant="icon" />
        </div>
    </div>

    <div className="min-w-0">
      <h4 className="text-xs font-semibold text-slate-800">LastMinuteITR Genie</h4>
      <p className="text-[10px] text-slate-500 truncate">
        {connectedConnectors.length > 0
          ? `Reading ${connectedConnectors.length} upload${connectedConnectors.length === 1 ? "" : "s"} · ask about your files`
          : netPayable != null
            ? `Est. ${formatINR(netPayable)} · 150+ tax guides`
            : "Upload Form 16/CAMS — I'll read them"}
      </p>
    </div>
  </div>     
  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {activeField && currentFieldGuidance ? (
          <div className="bg-gradient-to-br from-blue-50/70 to-blue-50/30 border border-blue-100/60 rounded-2xl p-4 shadow-sm space-y-2">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Focused field
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {currentFieldGuidance.title}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentFieldGuidance.tip}
            </p>
            <div className="text-[11px] text-blue-800 bg-blue-100/30 rounded-lg p-2.5 flex gap-2">
              <Lightbulb className="size-3.5 shrink-0 text-blue-600 mt-0.5" />
              <span>{currentFieldGuidance.impact}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col min-h-[320px] bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-3 py-2 border-b border-slate-100 flex items-center gap-1.5">
            <MessageSquare className="size-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Ask anything
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin bg-slate-50/20 max-h-[280px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1 rounded-xl p-2.5 max-w-[92%] leading-relaxed",
                  msg.role === "user"
                    ? "bg-slate-100 text-slate-900 self-end ml-auto rounded-tr-sm"
                    : "bg-blue-50/70 text-slate-800 border border-blue-100/40 self-start rounded-tl-sm"
                )}
              >
                <p className="font-semibold text-[9px] uppercase text-slate-400">
                  {msg.role === "user" ? "You" : "Genie"}
                </p>
                <p className="whitespace-pre-line text-xs">{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 animate-pulse p-2">Genie is typing…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-white shrink-0 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void handleSendQuestion(q)}
                  className="text-[10px] font-medium text-blue-600 bg-blue-50/40 hover:bg-blue-100 border border-blue-100/60 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendQuestion(inputText);
            }}
            className="p-2 border-t border-slate-100 bg-slate-50 shrink-0"
          >
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask in plain English…"
                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none px-1 py-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
