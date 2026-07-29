"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Menu, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useDraftStore } from "@/lib/store/draft";
import { useGenieFocus } from "@/lib/filing/useGenieFocus";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import {
  Banner,
  Button,
  Card,
  FilingActions,
  InfoHelp,
  ScreenTitle,
} from "@/components/filing/ui";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import {
  REVIEW_TABS,
  buildReviewUrl,
  parseReviewTab,
  type ReviewTab,
} from "@/lib/filing/routes";
import {
  getReviewTabStatuses,
  statusDotClass,
} from "@/lib/filing/navStatus";
import {
  buildDeductionChecklist,
  summarizeDeductionChecklist,
  type DeductionStatus,
} from "@/lib/filing/deductionChecklist";
import {
  buildReconciliationFlags,
  buildReconciliationStatements,
  summarizeReconciliationRows,
  type ReconciliationRow,
  type ReconciliationRowSeverity,
} from "@/lib/filing/reconciliation";
import { PORTAL_ITR1_SECTIONS } from "@/lib/engine/portalSections";
import type { ITRResult, TaxRegime } from "@/lib/engine/types";
import { SmartSavingsFinder } from "@/components/filing/SmartSavingsFinder";
import { BusinessIncomeCard } from "@/components/filing/BusinessIncomeCard";
import { CapitalGainsCard } from "@/components/filing/CapitalGainsCard";
import { HraCalculator } from "@/components/filing/wizards/HraCalculator";
import { MultiForm16SummaryCard } from "@/components/filing/wizards/MultiForm16SummaryCard";
import {
  buildSavingsCoachSummary,
  type SavingsCoachSummary,
} from "@/lib/engine/savingsCoach";
import { RECONCILE } from "@/lib/copy/strings";
import {
  is80DCashPaymentBlocked,
  SECTION_80D_CASH_MESSAGE,
} from "@/lib/tax/section80d";

const TAB_LABELS: Record<ReviewTab, string> = {
  import: "Import",
  income: "Income",
  deductions: "Deductions",
  taxes: "Taxes",
  summary: "Summary",
};

const DEDUCTION_STATUS_STYLE: Record<
  DeductionStatus,
  { label: string; className: string }
> = {
  claimed: { label: "Claimed", className: "bg-emerald-100 text-emerald-800" },
  "needs-proof": { label: "Needs proof", className: "bg-amber-100 text-amber-900" },
  "not-applicable": { label: "Not applicable", className: "bg-slate-100 text-slate-600" },
};

const ROW_STYLE: Record<
  ReconciliationRowSeverity,
  { label: string; badge: string; dot: string }
> = {
  matched: {
    label: "Matched",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  attention: {
    label: "Needs attention",
    badge: "bg-amber-100 text-amber-900",
    dot: "bg-amber-500",
  },
  missing: {
    label: "Add source",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

const DOC_SOURCES = [
  {
    id: "form16",
    label: "Form 16",
    role: "Salary & TDS from your employer",
    importHref: "/file/import/documents?source=form16",
  },
  {
    id: "ais",
    label: "AIS",
    role: "What the tax department already knows",
    importHref: "/file/import/documents?source=ais",
  },
  {
    id: "form26as",
    label: "Form 26AS",
    role: "TDS credited against your PAN",
    importHref: "/file/import/documents?source=form26as",
  },
] as const;

function reconValue(value: number | undefined): string {
  return value === undefined ? "—" : formatINR(value);
}

function ReconcileRowCard({ row }: { row: ReconciliationRow }) {
  const style = ROW_STYLE[row.severity];
  return (
    <li className="rounded-xl border border-slate-200 px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className={`size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
          {row.label}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
        >
          {style.label}
        </span>
      </div>
      <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        {(
          [
            ["Form 16", row.form16],
            ["AIS", row.ais],
            ["26AS", row.form26as],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg bg-slate-50 px-2 py-1.5"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </dt>
            <dd className="mt-0.5 text-xs font-semibold tabular-nums text-slate-800">
              {reconValue(value)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate-600">{row.detail}</p>
    </li>
  );
}

function PaywallOverlay({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/60 p-6 text-center backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 shadow-sm">
        <Lock className="h-6 w-6 text-slate-500" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title || "Unlock to see exact details"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        {message || "Choose a plan to see your full tax breakdown and fix any mismatches."}
      </p>
      <Button href="/file/checkout/payment" className="mt-6">
        View plans & unlock
      </Button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <Card>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      <Button href={ctaHref} variant="secondary" className="mt-3 self-start">
        {ctaLabel}
      </Button>
    </Card>
  );
}

function ImportTab() {
  const isPaid = Boolean(useDraftStore((s) => s.paidPlanId));
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const income = useDraftStore((s) => s.income);
  const deductions = useDraftStore((s) => s.deductions);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const regime = useDraftStore((s) => s.regime);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const employers = useMemo(() => income.employers ?? [], [income.employers]);

  const rows = useMemo(
    () =>
      buildReconciliationStatements({
        connectedConnectors,
        grossSalary: income.grossSalary,
        tds: income.tds,
        fdInterest: income.fdInterest,
        mismatchResolved,
      }),
    [connectedConnectors, income.grossSalary, income.tds, income.fdInterest, mismatchResolved]
  );
  const rowSummary = useMemo(() => summarizeReconciliationRows(rows), [rows]);

  const flags = useMemo(
    () =>
      buildReconciliationFlags({
        connectedConnectors,
        employers,
        grossSalary: income.grossSalary,
        tds: income.tds,
        mismatchResolved,
      }),
    [connectedConnectors, employers, income.grossSalary, income.tds, mismatchResolved]
  );
  const multiEmployerFlag = flags.find((f) => f.id === "multi-employer");

  const deductionItems = useMemo(
    () => buildDeductionChecklist({ deductions, houseProperty, income, regime }),
    [deductions, houseProperty, income, regime]
  );
  const deductionSummary = useMemo(
    () => summarizeDeductionChecklist(deductionItems),
    [deductionItems]
  );

  if (connectedConnectors.length === 0) {
    return (
      <EmptyState
        title="No documents imported yet"
        body="Upload your Form 16 and AIS so we can pre-fill salary and TDS, then cross-check against the tax department's records."
        ctaHref="/file/import/documents"
        ctaLabel="Import documents"
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Document sources — what's imported vs still to add */}
      <ul className="recon-doc-grid">
        {DOC_SOURCES.map((doc) => {
          const imported = connectedConnectors.includes(doc.id);
          return (
            <li
              key={doc.id}
              className={`flex flex-col rounded-2xl border p-4 ${
                imported
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{doc.label}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    imported
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      imported ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                    aria-hidden
                  />
                  {imported ? "Imported" : "Not imported"}
                </span>
              </div>
              <p className="mt-1 flex-1 text-xs text-slate-600">{doc.role}</p>
              {doc.id === "form16" && imported && (
                <p className="mt-2 text-xs font-medium tabular-nums text-slate-700">
                  Gross {formatINR(income.grossSalary)} · TDS {formatINR(income.tds)}
                </p>
              )}
              {!imported && (
                <Link
                  href={doc.importHref}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  Add {doc.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* Line-item three-way reconciliation */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900">Cross-check your figures</h3>
          <span className="text-xs text-slate-500">
            {rowSummary.matched} matched · {rowSummary.attention} need attention ·{" "}
            {rowSummary.missing} to add
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Form 16 vs AIS vs Form 26AS, line by line. Resolve attention rows before you
          file on the portal.
        </p>
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <ReconcileRowCard key={row.id} row={row} />
          ))}
        </ul>
        {multiEmployerFlag && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {multiEmployerFlag.detail}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button href="/file/import/mismatch" variant="secondary" className="self-start">
            Open number-difference screen
          </Button>
          <Button href="/file/import/documents" variant="ghost" className="self-start">
            Manage documents
          </Button>
        </div>
      </Card>

      {/* Deduction checklist summary — full detail lives on the Deductions tab */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Deduction checklist</h3>
          <Link
            href={buildReviewUrl("deductions")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Review all
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {deductionSummary.claimed} claimed · {deductionSummary.needsProof} need proof ·{" "}
          {deductionSummary.notApplicable} not applicable. Total claimed{" "}
          {formatINR(deductionSummary.totalClaimedAmount)}.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Only claim deductions that actually happened and that you can prove.
        </p>
      </Card>

      <FilingActions>
        <Button href="/file/review?tab=income">Next: Income Sources</Button>
      </FilingActions>
    </div>
  );
}

function IncomeTab({ result }: { result?: ITRResult | null }) {
  const income = useDraftStore((s) => s.income);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const regime = useDraftStore((s) => s.regime) ?? "new";
  const setIncome = useDraftStore((s) => s.setIncome);
  const setHouseProperty = useDraftStore((s) => s.setHouseProperty);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const matrix = useDraftStore((s) => s.matrix);
  const [editingSalary, setEditingSalary] = useState(false);
  const [editingHouseProperty, setEditingHouseProperty] = useState(false);
  const [editingOtherIncome, setEditingOtherIncome] = useState(false);
  const employers = income.employers ?? [];
  const hasBusinessIncome =
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive") ||
    matrix.business === "v" ||
    (income.businessRevenue ?? 0) > 0 ||
    (income.freelanceRevenue ?? 0) > 0;
  const hasCapitalGains =
    incomeChips.includes("capital_gains") || capitalGains !== null;
  const hasAnyIncome =
    income.grossSalary > 0 ||
    income.fdInterest > 0 ||
    houseProperty.propertyType !== "none" ||
    hasBusinessIncome ||
    hasCapitalGains ||
    incomeChips.includes("fno") ||
    incomeChips.includes("crypto") ||
    incomeChips.includes("foreign");

  // Hooks must run on every render — keep them above the empty-state return.
  const fnoTurnoverFocus = useGenieFocus("fno_turnover");
  const fnoProfitFocus = useGenieFocus("fno_profit");

  if (!hasAnyIncome) {
    return (
      <EmptyState
        title="No income captured yet"
        body="Add salary, house property, or other income so we can compute your tax."
        ctaHref="/file/income"
        ctaLabel="Add income"
      />
    );
  }

  const basicSalary = Math.round(income.grossSalary * 0.5);
  const fnoAudit =
    (income.fnoTurnover ?? 0) >= 10_00_00_000
      ? "Your F&O absolute turnover is at or above ₹10 crore — a tax audit may apply. We recommend a CA review."
      : null;

  return (
    <div className="space-y-3">
      <MultiForm16SummaryCard employers={employers} regime={regime} />

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Salary</h3>
          <button
            type="button"
            onClick={() => setEditingSalary((open) => !open)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {editingSalary ? "Done" : "Edit"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          <strong>Gross salary:</strong> {formatINR(income.grossSalary)}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          <strong>TDS:</strong> {formatINR(income.tds)}
        </p>
        {employers.length > 1 && (
          <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
            {employers.map((e) => (
              <li key={e.id} className="text-sm text-slate-600">
                {e.name}: {formatINR(e.grossSalary)} · TDS {formatINR(e.tds)}
              </li>
            ))}
          </ul>
        )}
        {editingSalary && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-700">
              Gross salary
              <input
                type="number"
                min="0"
                value={income.grossSalary || ""}
                onChange={(event) =>
                  setIncome({
                    grossSalary: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              TDS deducted
              <input
                type="number"
                min="0"
                value={income.tds || ""}
                onChange={(event) =>
                  setIncome({ tds: Math.max(0, Number(event.target.value) || 0) })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </Card>

      <HraCalculator
        hraReceived={income.hraReceived}
        basicSalary={basicSalary}
        actualRentPaid={income.actualRentPaid}
        cityTier={income.cityTier}
        onChange={(patch) => setIncome(patch)}
      />

      {(incomeChips.includes("fno") || (income.fnoTurnover ?? 0) > 0) && (
        <Card>
          <h3 className="font-semibold text-slate-900">F&amp;O / trading (Schedule BP)</h3>
          <p className="mt-2 text-sm text-slate-700">
            Absolute turnover: {formatINR(income.fnoTurnover ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Non-speculative P&amp;L: {formatINR(income.fnoNonSpeculativeProfit ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Speculative / intraday P&amp;L: {formatINR(income.fnoSpeculativeProfit ?? 0)}
          </p>
          {fnoAudit && (
            <p className="mt-2 text-sm text-amber-800">{fnoAudit}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <label className="text-xs">
              Turnover
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                value={income.fnoTurnover || ""}
                onChange={(e) =>
                  setIncome({ fnoTurnover: Math.max(0, Number(e.target.value) || 0) })
                }
                onFocus={fnoTurnoverFocus.onFocus}
              />
            </label>
            <label className="text-xs">
              F&amp;O profit
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                value={income.fnoNonSpeculativeProfit || ""}
                onChange={(e) =>
                  setIncome({
                    fnoNonSpeculativeProfit: Number(e.target.value) || 0,
                  })
                }
                onFocus={fnoProfitFocus.onFocus}
              />
            </label>
            <label className="text-xs">
              Intraday profit
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                value={income.fnoSpeculativeProfit || ""}
                onChange={(e) =>
                  setIncome({
                    fnoSpeculativeProfit: Number(e.target.value) || 0,
                  })
                }
              />
            </label>
          </div>
        </Card>
      )}

      {hasBusinessIncome && <BusinessIncomeCard result={result} />}

      {hasCapitalGains && <CapitalGainsCard />}

      {(incomeChips.includes("crypto") || incomeChips.includes("foreign") || incomeChips.includes("nri")) && (
        <Card>
          <h3 className="font-semibold text-slate-900">Guided schedules</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {incomeChips.includes("crypto") && (
              <Link href="/file/import/vda" className="text-primary font-medium underline">
                Edit crypto / VDA trades
              </Link>
            )}
            {(incomeChips.includes("foreign") || incomeChips.includes("nri")) && (
              <Link href="/file/import/foreign" className="text-primary font-medium underline">
                Edit NRI / Schedule FA
              </Link>
            )}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">House property</h3>
          <button
            type="button"
            onClick={() => setEditingHouseProperty((open) => !open)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {editingHouseProperty ? "Done" : "Edit"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {houseProperty.propertyType === "none"
            ? "None declared."
            : `${houseProperty.propertyType === "let_out" ? "Let out" : "Self-occupied"} · loan interest ${formatINR(houseProperty.homeLoanInterest)}`}
        </p>
        {editingHouseProperty && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-700 sm:col-span-2">
              Property situation
              <select
                value={houseProperty.propertyType}
                onChange={(event) =>
                  setHouseProperty({
                    propertyType: event.target.value as
                      | "none"
                      | "self_occupied"
                      | "let_out",
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="none">No house property income or loan interest</option>
                <option value="self_occupied">Self-occupied property</option>
                <option value="let_out">Let-out property</option>
              </select>
            </label>
            {houseProperty.propertyType === "let_out" && (
              <>
                <label className="text-xs font-medium text-slate-700">
                  Annual rent received
                  <input
                    type="number"
                    min="0"
                    value={houseProperty.annualRent || ""}
                    onChange={(event) =>
                      setHouseProperty({
                        annualRent: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Municipal tax paid
                  <input
                    type="number"
                    min="0"
                    value={houseProperty.municipalTax || ""}
                    onChange={(event) =>
                      setHouseProperty({
                        municipalTax: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
            {houseProperty.propertyType !== "none" && (
              <>
                <label className="text-xs font-medium text-slate-700">
                  Home-loan interest
                  <input
                    type="number"
                    min="0"
                    value={houseProperty.homeLoanInterest || ""}
                    onChange={(event) =>
                      setHouseProperty({
                        homeLoanInterest: Math.max(
                          0,
                          Number(event.target.value) || 0
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Your ownership share (%)
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={houseProperty.coOwnerPercent}
                    onChange={(event) =>
                      setHouseProperty({
                        coOwnerPercent: Math.min(
                          100,
                          Math.max(1, Number(event.target.value) || 100)
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Other sources</h3>
          <button
            type="button"
            onClick={() => setEditingOtherIncome((open) => !open)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {editingOtherIncome ? "Done" : "Edit"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          <strong>Interest income:</strong> {formatINR(income.fdInterest)}
        </p>
        {editingOtherIncome && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-700">
              Bank / FD interest
              <input
                type="number"
                min="0"
                value={income.fdInterest || ""}
                onChange={(event) =>
                  setIncome({
                    fdInterest: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Other taxable income
              <input
                type="number"
                min="0"
                value={income.otherIncome || ""}
                onChange={(event) =>
                  setIncome({
                    otherIncome: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </Card>

      <FilingActions>
        <Button href="/file/review?tab=deductions">Next: Deductions</Button>
      </FilingActions>
    </div>
  );
}

function DeductionsTab({ result }: { result: ITRResult | null }) {
  const deductions = useDraftStore((s) => s.deductions);
  const regime = useDraftStore((s) => s.regime);
  const setDeductions = useDraftStore((s) => s.setDeductions);
  const [paymentMode80D, setPaymentMode80D] = useState("upi");
  const cashBlocked = is80DCashPaymentBlocked(paymentMode80D);

  return (
    <div className="space-y-3">
      {regime === null && (
        <Banner variant="info">
          Regime not selected yet — statuses assume the old regime.{" "}
          <Link href="/file/regime" className="font-medium underline">
            Choose a regime
          </Link>
          .
        </Banner>
      )}
      <SmartSavingsFinder result={result} />

      <Card>
        <h3 className="font-semibold text-slate-900">Section 80D payment mode</h3>
        <p className="mt-1 text-sm text-slate-600">
          Health insurance and medical expenses must be paid by non-cash modes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["upi", "card", "cheque", "bank_transfer", "cash"].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                paymentMode80D === mode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() => {
                setPaymentMode80D(mode);
                if (is80DCashPaymentBlocked(mode) && deductions.section80D > 0) {
                  setDeductions({ section80D: 0 });
                }
              }}
            >
              {mode.replace("_", " ")}
            </button>
          ))}
        </div>
        {cashBlocked && (
          <Banner variant="warning">
            {SECTION_80D_CASH_MESSAGE}
          </Banner>
        )}
      </Card>

      <FilingActions>
        <Button href="/file/regime">Next: Tax Regime</Button>
      </FilingActions>
    </div>
  );
}

function ReconcileHero({
  result,
  selectedRegime,
  savingsCoach,
}: {
  result: ITRResult | null;
  selectedRegime: TaxRegime;
  savingsCoach: SavingsCoachSummary;
}) {
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const income = useDraftStore((s) => s.income);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const isPaid = Boolean(useDraftStore((s) => s.paymentVerifiedAt));

  const rowSummary = useMemo(
    () =>
      summarizeReconciliationRows(
        buildReconciliationStatements({
          connectedConnectors,
          grossSalary: income.grossSalary,
          tds: income.tds,
          fdInterest: income.fdInterest,
          mismatchResolved,
        })
      ),
    [connectedConnectors, income.grossSalary, income.tds, income.fdInterest, mismatchResolved]
  );

  const rc = result?.regime_comparison;
  const slab = rc?.[selectedRegime];
  const netPayable = savingsCoach.netPayable;
  const isRefund = savingsCoach.isRefund;
  const hasResult = Boolean(result && slab);
  const openItems = rowSummary.attention + rowSummary.missing;
  const recommendedRegimeLabel =
    rc?.recommended_regime === "old" ? "Old Tax Regime" : "New Tax Regime";

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50/80">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center">
        <div className="relative">
          {!isPaid && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/40 p-4 text-center backdrop-blur-md">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 shadow-sm mb-3">
                <Lock className="h-5 w-5 text-slate-500" aria-hidden />
              </div>
              <p className="text-sm font-bold text-slate-900">Unlock your snapshot</p>
              <Button href="/file/checkout/payment" className="mt-3 min-h-8 text-xs px-4">
                View plans & unlock
              </Button>
            </div>
          )}
          <div className={!isPaid ? "pointer-events-none select-none opacity-40 blur-[4px]" : ""}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {selectedRegime === "new" ? "New tax regime" : "Old tax regime"} · estimated result
            </p>
            {hasResult ? (
              <div className="mt-1 flex items-center gap-2">
                <p
                  className={`text-2xl font-bold tabular-nums sm:text-3xl ${
                    isRefund ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {isRefund ? "Estimated Refund: " : "Estimated Tax Payable: "}
                  <span>{isPaid ? formatINR(Math.abs(netPayable)) : "₹***"}</span>
                </p>
              </div>
            ) : (
              <p className="mt-1 text-2xl font-bold text-slate-400">
                Add income to see your estimate
              </p>
            )}
            {rc && savingsCoach.regimeDelta > 0 && (
              <p className="mt-1 text-xs text-emerald-700 sm:text-sm">
                Based on the details, {recommendedRegimeLabel} will save you{" "}
                <strong>{isPaid ? formatINR(savingsCoach.regimeDelta) : "₹***"}</strong>.
              </p>
            )}
            {savingsCoach.remainingUpside > 0 && (
              <p className="mt-1 text-xs font-medium leading-relaxed text-emerald-700 sm:text-sm">
                You will be able to claim up to{" "}
                <strong>{isPaid ? formatINR(savingsCoach.remainingUpside) : "₹***"}</strong>{" "}
                more in deductions.
              </p>
            )}
            {savingsCoach.totalPossibleUpside > savingsCoach.regimeDelta && (
              <p className="mt-1 text-sm text-slate-800">
                Total Estimated Tax Benefit: up to{" "}
                <strong>{isPaid ? formatINR(savingsCoach.totalPossibleUpside) : "₹***"}</strong>.
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              {savingsCoach.breakevenGap > 0 && (
                <InfoHelp
                  label="Why the new tax regime is recommended"
                  text={`Old Tax Regime would need about ${
                    isPaid ? formatINR(savingsCoach.breakevenGap) : "₹***"
                  } more eligible deductions to beat the New Tax Regime.`}
                />
              )}
              <InfoHelp
                label="About this estimated result"
                text="This is an estimate, not a promise. The Centralised Processing Centre decides your final refund after you file and e-verify on incometax.gov.in."
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Document comparison
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
            {openItems === 0 ? (
              <span className="font-semibold text-emerald-700">
                {RECONCILE.allClear}
              </span>
            ) : (
              <>
                <span className="font-semibold text-amber-700">{openItems}</span>{" "}
                {openItems === 1 ? "entry needs" : "entries need"} to be checked
                across your documents.
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {rowSummary.matched} matched · {rowSummary.attention} need review ·{" "}
            {rowSummary.missing} Documents Missing
          </p>
          {openItems > 0 && (
            <Link
              href="/file/import/mismatch"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Review differences
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

function ReviewDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseReviewTab(searchParams.get("tab"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const regime = useDraftStore((s) => s.regime);
  const navDraft = useDraftStore(
    useShallow((s) => ({
      profile: s.profile,
      matrix: s.matrix,
      income: s.income,
      houseProperty: s.houseProperty,
      extraProperties: s.extraProperties,
      carryForward: s.carryForward,
      depreciationBlocks: s.depreciationBlocks,
      deductions: s.deductions,
      regime: s.regime,
      incomeChips: s.incomeChips,
      connectedConnectors: s.connectedConnectors,
      mismatchResolved: s.mismatchResolved,
      lastParseResult: s.lastParseResult,
      questionAnswers: s.questionAnswers,
    }))
  );
  const tabStatuses = getReviewTabStatuses(navDraft);

  const { loading, error, engineUnavailable, result, lastSnapshot, userInput, compute } =
    useDraftTaxCompute();
  const effectiveResult = result ?? lastSnapshot;
  const selectedRegime: TaxRegime =
    regime ?? effectiveResult?.regime_comparison.recommended_regime ?? "new";
  const savingsCoach = useMemo(
    () =>
      buildSavingsCoachSummary({
        result: effectiveResult,
        selectedRegime,
        questionContext: {
          result: effectiveResult,
          userInput,
          draft: {
            profile: navDraft.profile,
            income: navDraft.income,
            incomeChips: navDraft.incomeChips,
            connectedConnectors: navDraft.connectedConnectors,
            mismatchResolved: navDraft.mismatchResolved,
            lastParseResult: navDraft.lastParseResult,
            houseProperty: navDraft.houseProperty,
            extraProperties: navDraft.extraProperties,
            carryForward: navDraft.carryForward,
            depreciationBlocks: navDraft.depreciationBlocks,
            deductions: navDraft.deductions,
          },
          questionAnswers: navDraft.questionAnswers,
        },
      }),
    [effectiveResult, selectedRegime, userInput, navDraft]
  );

  const selectTab = (tab: ReviewTab) => {
    setIsMobileMenuOpen(false);
    router.replace(buildReviewUrl(tab), { scroll: false });
  };

  const needsCompute = activeTab === "taxes" || activeTab === "summary";

  return (
    <FilingLayout mirrorText={RECONCILE.hubMirror}>
      <ScreenTitle title="Your Tax Filing Summary" />

      <ReconcileHero
        result={effectiveResult}
        selectedRegime={selectedRegime}
        savingsCoach={savingsCoach}
      />

      {needsCompute && error && (
        <EngineComputeFallback
          loading={loading}
          error={error}
          engineUnavailable={engineUnavailable}
          lastSnapshot={lastSnapshot}
          onRetry={() => void compute(userInput)}
        />
      )}

      <div className="mb-4 flex flex-col gap-4">
        {activeTab === "import" && <ImportTab />}
        {activeTab === "income" && <IncomeTab result={effectiveResult} />}
        {activeTab === "deductions" && <DeductionsTab result={effectiveResult} />}
      </div>
    </FilingLayout>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <FilingLayout>
          <ScreenTitle title="Your Tax Filing Summary" subtitle="Loading your draft…" />
          <SkeletonRows />
        </FilingLayout>
      }
    >
      <ReviewDashboard />
    </Suspense>
  );
}
