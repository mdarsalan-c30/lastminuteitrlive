"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDraftStore, type FieldConfidence } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Banner,
  Button,
  FilingActions,
  Card,
  ScreenTitle,
} from "@/components/filing/ui";
import { PlainEnglishHelp } from "@/components/filing/PlainEnglishHelp";
import { ImportRevealPanel } from "@/components/filing/ImportRevealPanel";

const CONFIDENCE_STYLES: Record<
  FieldConfidence,
  { label: string; className: string }
> = {
  high: {
    label: "High confidence",
    className: "bg-emerald-100 text-emerald-800",
  },
  review: {
    label: "Review",
    className: "bg-amber-100 text-amber-900",
  },
  missing: {
    label: "Missing",
    className: "bg-zinc-100 text-zinc-600",
  },
};

function ConfidenceBadge({ level }: { level: FieldConfidence }) {
  const style = CONFIDENCE_STYLES[level];
  return (
    <span
      className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default function ParsingPage() {
  const router = useRouter();
  const {
    income,
    deductions,
    lastParseResult,
    connectedConnectors,
    seedPrimaryEmployer,
    removeEmployerForm16,
  } = useDraftStore();
  const employers = income.employers ?? [];
  const hasMultipleEmployers = employers.length > 1;
  // When several Form 16s are merged, the "Latest Form 16" card should reflect
  // the most-recently-added single employer, not the combined aggregate.
  const latestEmployer = hasMultipleEmployers
    ? employers[employers.length - 1]
    : null;
  const latestForm16 = {
    name: latestEmployer?.name ?? income.employer,
    grossSalary: latestEmployer?.grossSalary ?? income.grossSalary,
    tds: latestEmployer?.tds ?? income.tds,
  };

  const handleAddAnotherForm16 = useCallback(() => {
    seedPrimaryEmployer();
    router.push("/file/import/documents?source=form16&addEmployer=1");
  }, [router, seedPrimaryEmployer]);

  const aisConnected = useMemo(
    () => connectedConnectors.includes("ais"),
    [connectedConnectors]
  );

  const onlyForm16Connected = useMemo(() => {
    const connected = new Set(connectedConnectors);
    return connected.has("form16") && !connected.has("ais") && !connected.has("form26as");
  }, [connectedConnectors]);

  const fieldConfidence = useMemo(
    () => lastParseResult?.fieldConfidence ?? {},
    [lastParseResult?.fieldConfidence]
  );
  const isDemoFallback =
    !lastParseResult || lastParseResult.mode === "demo_fallback";

  const parsedFieldCount = useMemo(() => {
    const keys = Object.keys(fieldConfidence);
    if (keys.length === 0) return null;
    return keys.filter((k) => fieldConfidence[k] !== "missing").length;
  }, [fieldConfidence]);

  const reviewCount = useMemo(
    () =>
      Object.values(fieldConfidence).filter((level) => level === "review")
        .length,
    [fieldConfidence]
  );

  const subtitle = parsedFieldCount
    ? `We imported ${parsedFieldCount} field${parsedFieldCount === 1 ? "" : "s"} from your Form 16.${
        reviewCount > 0
          ? ` Please review ${reviewCount} field${reviewCount === 1 ? "" : "s"} marked for confirmation.`
          : ""
      }`
    : "Review salary, TDS, and deduction figures from your Form 16 before continuing.";

  return (
    <FilingLayout
      mirrorText="Every rupee here flows into your tax calculation. Wrong salary or TDS now means a mismatch notice later."
    >
      <div role="status">
        {isDemoFallback ? (
          <Banner variant="warning">
            <strong>Demo fallback</strong> — we could not fully read your PDF, so
            these figures are sample data. Verify every amount against your actual
            Form 16 before filing.
          </Banner>
        ) : (
          <Banner variant="success">
            <strong>Imported from your Form 16.</strong> Figures came straight from
            your upload — still confirm each one against the document before filing.
          </Banner>
        )}
      </div>

      <ScreenTitle title="Review imported data" subtitle={subtitle} />

      <PlainEnglishHelp
        summary="This page is your quick sanity check before we calculate tax."
        points={[
          "Gross salary should match your Form 16 total salary.",
          "TDS is tax already cut by your employer.",
          "If a number looks wrong, edit it now or re-upload.",
          "If you are unsure, keep the document open and compare line by line.",
        ]}
      />

      {!isDemoFallback && (
        <ImportRevealPanel
          employerName={income.employer ?? ""}
          grossSalary={income.grossSalary ?? 0}
          tds={income.tds ?? 0}
          section80C={deductions.section80C ?? 0}
          employerCount={employers.length}
          aisConnected={aisConnected}
        />
      )}

      {onlyForm16Connected && (
        <Banner variant="warning">
          Only Form 16 is connected so far.{" "}
          <Link href="/file/import/documents" className="font-medium underline">
            Add AIS
          </Link>{" "}
          for mismatch checks, or confirm on the review screens that you have no
          other income beyond what Form 16 covers.
        </Banner>
      )}

      {lastParseResult?.filenames && lastParseResult.filenames.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-2">Uploaded files</h3>
          <ul className="list-inside list-disc text-sm text-slate-700 space-y-1">
            {lastParseResult.filenames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Card>
      )}

      {lastParseResult?.warnings && lastParseResult.warnings.length > 0 && (
        <Banner variant="warning">{lastParseResult.warnings.join(" ")}</Banner>
      )}

      <Banner variant="warning">
        Review carefully. Wrong numbers here cause mismatches later.
      </Banner>

      {hasMultipleEmployers && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-1">
            Combined across {employers.length} employers (job change)
          </h3>
          <p className="text-sm text-slate-700">
            <strong>Total gross salary:</strong> {formatINR(income.grossSalary)}
          </p>
          <p className="text-sm text-slate-700 mt-1 mb-3">
            <strong>Total TDS:</strong> {formatINR(income.tds)}
          </p>
          <ul className="space-y-2">
            {employers.map((employer) => (
              <li
                key={employer.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="font-medium text-slate-900">
                    {employer.name}
                  </span>
                  <span className="block text-slate-600">
                    Salary {formatINR(employer.grossSalary)} · TDS{" "}
                    {formatINR(employer.tds)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeEmployerForm16(employer.id)}
                  className="ml-3 shrink-0 text-sm font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <Banner variant="warning">
            Cross-check the combined TDS against your Form 26AS / AIS. Each
            employer reports TDS separately — the portal expects the total.
          </Banner>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">
          {hasMultipleEmployers ? "Latest Form 16" : "From Form 16"} —{" "}
          {latestForm16.name}
          {fieldConfidence.employer && (
            <ConfidenceBadge level={fieldConfidence.employer} />
          )}
        </h3>
        {hasMultipleEmployers && (
          <p className="mb-2 text-xs text-slate-500">
            This card shows your most recent employer only. The combined totals are
            in the job-change summary above.
          </p>
        )}
        <p className="text-sm text-slate-700">
          <strong>Gross salary:</strong> {formatINR(latestForm16.grossSalary)}
          {fieldConfidence.grossSalary && (
            <ConfidenceBadge level={fieldConfidence.grossSalary} />
          )}
        </p>
        <p className="text-sm text-slate-700 mt-1">
          <strong>TDS:</strong> {formatINR(latestForm16.tds)}
          {fieldConfidence.tds && (
            <ConfidenceBadge level={fieldConfidence.tds} />
          )}
        </p>
        <p className="text-sm text-slate-700 mt-1">
          <strong>80C (Part B):</strong> {formatINR(deductions.section80C)}
          {fieldConfidence.section80C && (
            <ConfidenceBadge level={fieldConfidence.section80C} />
          )}
        </p>
        <Button href="/file/income" variant="ghost" className="mt-3">
          Edit inline
        </Button>
      </Card>

      <FilingActions>
        <Button href="/file/import/bank">Confirm & merge</Button>
        <Button onClick={handleAddAnotherForm16} variant="ghost">
          Add another Form 16 (job change)
        </Button>
        <Button href="/file/import/documents" variant="ghost">
          Re-upload
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}
