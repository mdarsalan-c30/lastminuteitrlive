"use client";

/**
 * SmartSavingsFinder — the "personal CA asks the right questions" panel.
 *
 * Renders deterministic deduction-discovery questions (lib/engine/
 * deductionDiscovery.ts), each with an "up to ₹X" saving estimate.
 * Answers write straight into the draft store so tax recomputes live.
 * No LLM involved — every number comes from statutory caps.
 *
 * Covers Chapter VI-A deductions PLUS ITR-2/3 levers:
 * brought-forward losses, second property, depreciation blocks.
 */

import { useMemo, useState } from "react";
import { useDraftStore } from "@/lib/store/draft";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import {
  generateDeductionDiscoveryQuestions,
  type DiscoveryQuestion,
} from "@/lib/engine/deductionDiscovery";
import { PROFESSION_OPTIONS } from "@/lib/engine/professionQuestions";
import type { ITRResult } from "@/lib/engine/types";
import { WhyExpander } from "@/components/ds/WhyExpander";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, IndianRupee, Check, X } from "lucide-react";

/** Questions whose "yes" amount can be applied to a draft field directly. */
const AMOUNT_TARGETS: Record<
  string,
  { field: "section80C" | "section80D" | "npsExtra" | "section80GG"; label: string }
> = {
  disc_80c: { field: "section80C", label: "Total 80C amount (₹)" },
  disc_home_loan_principal: { field: "section80C", label: "Principal repaid (₹)" },
  disc_80d_self: { field: "section80D", label: "Premium paid (₹)" },
  disc_80d_parents: { field: "section80D", label: "Premium for parents (₹)" },
  disc_nps_1b: { field: "npsExtra", label: "NPS contribution (₹)" },
  disc_rent_80gg: { field: "section80GG", label: "Annual rent paid (₹)" },
};

/** Carry-forward loss fields — one amount, applied to the right CFL bucket. */
const CF_TARGETS: Record<
  string,
  {
    field: "stcl" | "ltcl" | "hpLoss" | "businessLoss" | "unabsorbedDepreciation";
    label: string;
  }
> = {
  disc_bf_losses: { field: "stcl", label: "Unused capital loss (₹)" },
};

/** Where to enter facts we can't apply inline (honesty: no silent no-ops). */
const MANUAL_HINTS: Record<string, string> = {
  disc_80ccd2:
    "Noted. Add the employer NPS amount on the Income screen (it's in Form 16 Part B).",
  disc_savings_interest:
    "Noted. Add your interest on the Other income screen so it counts.",
  disc_80e:
    "Noted. Keep your loan interest certificate ready — a CA review will include it before filing.",
  disc_80g:
    "Noted. Keep the 80G receipt ready — a CA review will include it before filing.",
  disc_digital_receipts:
    "Noted. Update your digital receipts share on the Business income screen.",
  disc_books_vs_presumptive:
    "Noted. We'll flag your return for a books-vs-presumptive comparison.",
  disc_bf_sec80:
    "Noted. If the loss-year return was late, capital and business losses cannot be carried forward.",
  prof_doctor_indemnity:
    "Noted. Keep the premium receipt — we'll flag your return for a books-vs-presumptive comparison.",
  prof_doctor_equipment:
    "Noted. Add the equipment cost as a depreciation block on the Income screen (15% rate).",
  prof_doctor_pharmacy:
    "Noted. We'll treat pharmacy sales as 44AD business income and consultations as 44ADA — usually lower tax.",
  prof_lawyer_chamber:
    "Noted. Keep expense proofs — we'll flag your return for a books-vs-presumptive comparison.",
  prof_it_equipment:
    "Noted. Add the equipment as a depreciation block on the Income screen (computers depreciate at 40%).",
  prof_it_foreign_clients:
    "Noted. Make sure all foreign receipts are in your gross receipts — AIS usually shows them.",
  prof_creator_gifts:
    "Noted. Barter and freebies above ₹20,000 count as income (194R) — include their fair value in receipts.",
  prof_gig_tds:
    "Noted. Check Form 26AS for platform TDS — it comes back as refund if your total tax is lower.",
};

function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function SmartSavingsFinder({ result }: { result?: ITRResult | null }) {
  const filingMode = useDraftStore((s) => s.filingMode);
  const profile = useDraftStore((s) => s.profile);
  const matrix = useDraftStore((s) => s.matrix);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const income = useDraftStore((s) => s.income);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const extraProperties = useDraftStore((s) => s.extraProperties);
  const carryForward = useDraftStore((s) => s.carryForward);
  const depreciationBlocks = useDraftStore((s) => s.depreciationBlocks);
  const deductions = useDraftStore((s) => s.deductions);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const lastParseResult = useDraftStore((s) => s.lastParseResult);
  const questionAnswers = useDraftStore((s) => s.questionAnswers);
  const setQuestionAnswer = useDraftStore((s) => s.setQuestionAnswer);
  const setDeductions = useDraftStore((s) => s.setDeductions);
  const setCarryForward = useDraftStore((s) => s.setCarryForward);
  const addExtraProperty = useDraftStore((s) => s.addExtraProperty);
  const setDepreciationBlocks = useDraftStore((s) => s.setDepreciationBlocks);
  const setHouseProperty = useDraftStore((s) => s.setHouseProperty);
  const profession = useDraftStore((s) => s.profession);
  const setProfession = useDraftStore((s) => s.setProfession);
  const ensureIncomeChip = useDraftStore((s) => s.ensureIncomeChip);

  const hasBusinessChips =
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive") ||
    incomeChips.includes("fno");

  const [amountDraftById, setAmountDraftById] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const questions = useMemo(() => {
    const userInput = draftToUserInput({
      filingMode,
      profile,
      matrix,
      incomeChips,
      income,
      houseProperty,
      extraProperties,
      carryForward,
      depreciationBlocks,
      deductions,
      connectedConnectors,
      capitalGains,
      profession,
    });
    const recommendedRegime = result?.regime_comparison.recommended_regime;
    return generateDeductionDiscoveryQuestions({
      result,
      userInput,
      draft: {
        profile,
        income,
        incomeChips,
        connectedConnectors,
        mismatchResolved,
        lastParseResult,
        houseProperty,
        extraProperties,
        carryForward,
        depreciationBlocks,
        deductions,
        profession,
      },
      questionAnswers,
    })
      .filter((question) => {
        if (question.regimeScope === "both") return true;
        return recommendedRegime !== "new";
      })
      .slice(0, 6);
  }, [
    filingMode, profile, matrix, incomeChips, income, houseProperty,
    extraProperties, carryForward, depreciationBlocks, deductions,
    connectedConnectors, capitalGains, mismatchResolved, lastParseResult,
    questionAnswers, result, profession,
  ]);

  const handleSideIncome = (q: DiscoveryQuestion) => {
    ensureIncomeChip("freelance");
    setQuestionAnswer(q.id, { answer: "yes" });
    setConfirmation(
      "Great — we added Freelance to your income sources. Enter what you earned on the Income tab; presumptive tax makes it simple (often only 50% or less of receipts is taxed)."
    );
  };

  const handleYesWithAmount = (q: DiscoveryQuestion) => {
    const target = AMOUNT_TARGETS[q.id];
    if (!target) return;
    const amount = Number(amountDraftById[q.id]) || 0;
    if (amount <= 0) return;
    const current = deductions[target.field] ?? 0;
    // 80C-family answers add to the pool; dedicated fields replace 0
    setDeductions({ [target.field]: current + amount });
    if (q.id === "disc_home_loan_principal") {
      setHouseProperty({ homeLoanPrincipal: amount });
    }
    setQuestionAnswer(q.id, { answer: "yes", amount });
    setConfirmation(
      `Added ${formatINR(amount)} under Section ${q.section}. Your tax updates automatically.`
    );
  };

  const handleBfLoss = (q: DiscoveryQuestion) => {
    const target = CF_TARGETS[q.id];
    if (!target) return;
    const amount = Number(amountDraftById[q.id]) || 0;
    if (amount <= 0) return;
    setCarryForward({ [target.field]: amount });
    setQuestionAnswer(q.id, { answer: "yes", amount });
    setConfirmation(
      `Added ${formatINR(amount)} as a prior-year loss. It will set off against this year's income where the law allows — keep last year's ITR acknowledgment ready.`
    );
  };

  const handleSecondProperty = (q: DiscoveryQuestion) => {
    addExtraProperty({ propertyType: "let_out" });
    setQuestionAnswer(q.id, { answer: "yes" });
    setConfirmation(
      "Added a second property card. Fill rent and loan interest on the Income screen — we route you to ITR-2 automatically."
    );
  };

  const handleDepreciation = (q: DiscoveryQuestion) => {
    const amount = Number(amountDraftById[q.id]) || 0;
    if (amount <= 0) return;
    setDepreciationBlocks([
      ...depreciationBlocks,
      {
        id: `dep_${Date.now()}`,
        label: "plant_machinery_15",
        rate: 0.15,
        openingWdv: amount,
        additionsFullYear: 0,
        additionsHalfYear: 0,
        saleProceeds: 0,
      },
    ]);
    setQuestionAnswer(q.id, { answer: "yes", amount });
    setConfirmation(
      `Added a plant & machinery block with opening WDV ${formatINR(amount)} (15% rate). Depreciation reduces your books profit automatically.`
    );
  };

  const handleYesManual = (q: DiscoveryQuestion) => {
    setQuestionAnswer(q.id, { answer: "yes" });
    setConfirmation(MANUAL_HINTS[q.id] ?? "Noted.");
  };

  const handleSec80 = (onTime: boolean) => {
    setCarryForward({ priorReturnOnTime: onTime });
    setQuestionAnswer("disc_bf_sec80", { answer: onTime ? "on_time" : "late" });
    setConfirmation(
      onTime
        ? "Noted — prior-year losses can be set off."
        : "Noted — capital and business losses from that year cannot be carried forward (Sec 80)."
    );
  };

  const handleNo = (q: DiscoveryQuestion) => {
    setQuestionAnswer(q.id, { answer: "no" });
    setConfirmation(null);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 flex items-start gap-3">
        <Check className="size-5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            No missed deductions found
          </p>
          <p className="text-xs text-slate-600 mt-1">
            We checked every common deduction and ITR-2/3 lever against what you
            have entered.
            {confirmation ? ` ${confirmation}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4.5 text-blue-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Your CA would ask you this
        </h3>
      </div>
      <p className="text-xs text-slate-600 -mt-2">
        Lawful deductions and prior-year losses people commonly miss. Answer
        only what is true — every claim needs proof.
      </p>

      {hasBusinessChips && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <label
            htmlFor="ssf-profession"
            className="text-xs font-semibold text-slate-700"
          >
            What do you do? We ask sharper questions once we know.
          </label>
          <select
            id="ssf-profession"
            value={profession ?? ""}
            onChange={(e) => setProfession(e.target.value || null)}
            className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
          >
            <option value="">Select your field…</option>
            {PROFESSION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {confirmation && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
          {confirmation}
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q) => {
          const amountTarget = AMOUNT_TARGETS[q.id];
          const cfTarget = CF_TARGETS[q.id];
          const isSecondProperty = q.id === "disc_second_property";
          const isDepreciation = q.id === "disc_depreciation";
          const isSec80 = q.id === "disc_bf_sec80";
          const isSideIncome = q.id === "prof_side_income";

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-800">{q.prompt}</p>
                {q.estimatedSaving > 0 && (
                  <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <IndianRupee className="size-3" />
                    up to {Math.round(q.estimatedSaving).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <WhyExpander summary="Why we ask" detail={q.whyWeAsk} />

              <div className="flex flex-wrap items-center gap-2">
                {amountTarget ? (
                  <>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={amountTarget.label}
                      value={amountDraftById[q.id] ?? ""}
                      onChange={(e) =>
                        setAmountDraftById((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="h-8 w-44 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!(Number(amountDraftById[q.id]) > 0)}
                      onClick={() => handleYesWithAmount(q)}
                    >
                      <Check className="size-3.5 mr-1" /> Yes, add it
                    </Button>
                  </>
                ) : cfTarget ? (
                  <>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={cfTarget.label}
                      value={amountDraftById[q.id] ?? ""}
                      onChange={(e) =>
                        setAmountDraftById((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="h-8 w-48 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!(Number(amountDraftById[q.id]) > 0)}
                      onClick={() => handleBfLoss(q)}
                    >
                      <Check className="size-3.5 mr-1" /> Yes, add it
                    </Button>
                  </>
                ) : isDepreciation ? (
                  <>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="Opening WDV (₹)"
                      value={amountDraftById[q.id] ?? ""}
                      onChange={(e) =>
                        setAmountDraftById((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="h-8 w-44 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!(Number(amountDraftById[q.id]) > 0)}
                      onClick={() => handleDepreciation(q)}
                    >
                      <Check className="size-3.5 mr-1" /> Yes, add it
                    </Button>
                  </>
                ) : isSecondProperty ? (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleSecondProperty(q)}
                  >
                    <Check className="size-3.5 mr-1" /> Yes, I have another
                  </Button>
                ) : isSideIncome ? (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleSideIncome(q)}
                  >
                    <Check className="size-3.5 mr-1" /> Yes, I earned extra
                  </Button>
                ) : isSec80 ? (
                  <>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleSec80(true)}
                    >
                      Filed on time
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleSec80(false)}
                    >
                      Filed late
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleYesManual(q)}
                  >
                    <Check className="size-3.5 mr-1" /> Yes
                  </Button>
                )}
                {!isSec80 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => handleNo(q)}
                  >
                    <X className="size-3.5 mr-1" /> Doesn&apos;t apply
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
