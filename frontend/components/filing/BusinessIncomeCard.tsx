"use client";

import Link from "next/link";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { Card } from "@/components/filing/ui";
import { PROFESSION_OPTIONS } from "@/lib/engine/professionQuestions";
import { useGenieFocus } from "@/lib/filing/useGenieFocus";
import type { ITRResult } from "@/lib/engine/types";

/**
 * Business & freelance income entry (ITR-4 presumptive / ITR-3 books).
 *
 * The gate only asks "do you have business income?" — this card is where the
 * actual receipts get typed in. It routes the engine correctly:
 * - 44ADA professions → presumptive_profession (50% deemed profit)
 * - other businesses  → presumptive_business (6% deemed profit, digital)
 * - "I keep books"    → regular_books with receipts − expenses (ITR-3)
 */

const CAP_44ADA = 75_00_000;
const CAP_44AD = 3_00_00_000;

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? parseInt(digits, 10) : 0;
}

function formatAmountInput(value: number | undefined): string {
  return value && value > 0 ? value.toLocaleString("en-IN") : "";
}

export function BusinessIncomeCard({ result }: { result?: ITRResult | null }) {
  const income = useDraftStore((s) => s.income);
  const setIncome = useDraftStore((s) => s.setIncome);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const matrix = useDraftStore((s) => s.matrix);
  const setMatrix = useDraftStore((s) => s.setMatrix);
  const profession = useDraftStore((s) => s.profession);
  const setProfession = useDraftStore((s) => s.setProfession);
  const ensureIncomeChip = useDraftStore((s) => s.ensureIncomeChip);
  const toggleIncomeChip = useDraftStore((s) => s.toggleIncomeChip);

  const receiptsFocus = useGenieFocus("business_receipts");

  const usesBooks = matrix.business === "v";
  const selectedOption =
    PROFESSION_OPTIONS.find((o) => o.id === profession) ?? null;
  const isProfession = selectedOption ? selectedOption.is44ada : true;

  const receipts = usesBooks || !isProfession
    ? income.businessRevenue ?? 0
    : income.freelanceRevenue ?? 0;
  const expenses = income.businessExpenses ?? 0;

  const applyWorkType = (professionId: string) => {
    setProfession(professionId);
    const opt = PROFESSION_OPTIONS.find((o) => o.id === professionId);
    const nowProfession = opt ? opt.is44ada : true;
    // Move any amount already typed into the right bucket for the engine.
    const amount = Math.max(
      income.freelanceRevenue ?? 0,
      income.businessRevenue ?? 0
    );
    if (usesBooks) return; // books path always uses businessRevenue
    if (nowProfession) {
      setIncome({ freelanceRevenue: amount, businessRevenue: 0 });
      if (incomeChips.includes("business_presumptive")) {
        toggleIncomeChip("business_presumptive");
      }
      ensureIncomeChip("freelance");
    } else {
      setIncome({ businessRevenue: amount, freelanceRevenue: 0 });
      ensureIncomeChip("business_presumptive");
    }
  };

  const applyReceipts = (value: string) => {
    const amount = parseAmount(value);
    if (usesBooks || !isProfession) {
      setIncome({ businessRevenue: amount, freelanceRevenue: 0 });
    } else {
      setIncome({ freelanceRevenue: amount, businessRevenue: 0 });
    }
  };

  const toggleBooks = (checked: boolean) => {
    if (checked) {
      // Books path (ITR-3): receipts − actual expenses, engine needs businessRevenue.
      setMatrix({ business: "v" });
      const amount = Math.max(
        income.freelanceRevenue ?? 0,
        income.businessRevenue ?? 0
      );
      setIncome({ businessRevenue: amount, freelanceRevenue: 0 });
    } else {
      setMatrix({ business: "x" });
      // Back to presumptive — re-bucket via current work type.
      if (isProfession) {
        setIncome({
          freelanceRevenue: income.businessRevenue ?? 0,
          businessRevenue: 0,
          businessExpenses: 0,
        });
      }
    }
  };

  const engineBusiness = result?.business_income;
  const deemedProfit = usesBooks
    ? Math.max(0, receipts - expenses)
    : isProfession
      ? Math.round(receipts * 0.5)
      : Math.round(receipts * 0.06);

  const capWarning = !usesBooks
    ? isProfession && receipts > CAP_44ADA
      ? "Receipts above ₹75 lakh — the 50% presumptive rate (44ADA) may not apply. A CA review is a good idea."
      : !isProfession && receipts > CAP_44AD
        ? "Turnover above ₹3 crore — presumptive tax (44AD) may not apply and an audit may be needed. A CA review is a good idea."
        : null
    : null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Business &amp; freelance income</h3>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          {usesBooks ? "ITR-3 · books" : isProfession ? "44ADA · 50% rule" : "44AD · 6% rule"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {usesBooks
          ? "You entered actual receipts and expenses — we use receipts minus expenses as your profit."
          : isProfession
            ? "For listed professions, tax law assumes 50% of your receipts is profit — no expense proofs needed."
            : "For small businesses, tax law assumes 6% of digital turnover is profit — no expense proofs needed."}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-700">
          What work do you do?
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-normal"
            value={profession ?? ""}
            onChange={(e) => applyWorkType(e.target.value)}
          >
            <option value="" disabled>
              Pick the closest match
            </option>
            {PROFESSION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          {usesBooks
            ? "Total receipts this year"
            : isProfession
              ? "Professional receipts this year"
              : "Business turnover this year"}
          <input
            type="text"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-normal"
            placeholder="e.g. 18,00,000"
            value={formatAmountInput(receipts)}
            onChange={(e) => applyReceipts(e.target.value)}
            onFocus={receiptsFocus.onFocus}
          />
        </label>
        {usesBooks && (
          <label className="text-xs font-semibold text-slate-700">
            Actual business expenses this year
            <input
              type="text"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-normal"
              placeholder="e.g. 6,00,000"
              value={formatAmountInput(expenses)}
              onChange={(e) =>
                setIncome({ businessExpenses: parseAmount(e.target.value) })
              }
            />
          </label>
        )}
      </div>

      {receipts > 0 && (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
          <p className="text-sm text-emerald-900">
            <strong>Taxable profit we&apos;ll use:</strong>{" "}
            {formatINR(engineBusiness?.net_business_income ?? deemedProfit)}
            {engineBusiness?.section_used && engineBusiness.section_used !== "none" && (
              <span className="text-emerald-700">
                {" "}
                ·{" "}
                {engineBusiness.section_used === "books"
                  ? "receipts minus expenses"
                  : `Section ${engineBusiness.section_used}`}
              </span>
            )}
          </p>
          {!usesBooks && (
            <p className="mt-0.5 text-xs text-emerald-800">
              Tax is charged on this deemed profit, not your full receipts. If your
              real expenses are much higher, tick &quot;I keep books&quot; below.
            </p>
          )}
        </div>
      )}

      {capWarning && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {capWarning}
        </p>
      )}

      <label className="mt-3 flex items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={usesBooks}
          onChange={(e) => toggleBooks(e.target.checked)}
        />
        <span>
          I keep books of accounts and want to use actual expenses instead
          (files as ITR-3). Most freelancers do better with the simple
          presumptive rate.
        </span>
      </label>

      <p className="mt-3 text-xs text-slate-500">
        Not sure which applies?{" "}
        <Link href="/learn" className="font-medium text-primary underline">
          Read our 44AD vs 44ADA guide
        </Link>{" "}
        or ask the Genie on the right.
      </p>
    </Card>
  );
}
