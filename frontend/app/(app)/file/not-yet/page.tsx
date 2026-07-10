"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button } from "@/components/filing/ui";
import { SITE_DISCLAIMER } from "@/lib/seo/marketingDisclaimers";

const ENTITY_FORMS = new Set(["ITR-5", "ITR-6", "ITR-7"]);

const ENTITY_CHECKLIST: Record<string, string[]> = {
  "ITR-5": [
    "Partnership deed or LLP agreement",
    "Profit & loss account and balance sheet for FY 2025-26",
    "Partner capital accounts and remuneration details",
    "GST returns (if registered) and bank statements",
    "TDS certificates (Form 16A) and Form 26AS of the firm",
  ],
  "ITR-6": [
    "Audited financial statements (P&L, balance sheet, audit report)",
    "Tax audit report (Form 3CA/3CD) if applicable",
    "Director and shareholding details",
    "TDS certificates and Form 26AS of the company",
    "Details of MAT credit and brought-forward losses",
  ],
};

/**
 * Guided handoff — never a dead end (doc 40 / doc 21).
 * Every user gets a clear next step: CA-assisted filing or ITD portal with
 * our checklist. Never a paywall, chatbot, or retry-loop.
 */
function NotYetContent() {
  const searchParams = useSearchParams();
  const form = searchParams.get("form") ?? "ITR-2";
  const reason =
    searchParams.get("reason") ??
    "Your case needs schedules that work best with an expert alongside you.";
  const isEntity = ENTITY_FORMS.has(form);
  const checklist = ENTITY_CHECKLIST[form];

  return (
    <FilingLayout mirrorText="Every tax case has a path. Ours is to get you to the right one, fast.">
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Your guided path
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEntity
              ? `Your ${form} filing — we handle it with a partner CA.`
              : "Your case needs an expert's hands — and we bring the expert to you."}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">{reason}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            The right form for you: <span className="text-blue-700">{form}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {isEntity
              ? "Entity returns need audited figures and schedules a CA signs off on. Our partner CA prepares and files it with you — you stay in control at every step."
              : "We will not risk a wrong filing for you. A quick expert review keeps your return safe, and we route your case the same day."}
          </p>
        </div>

        {checklist && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Get a head start — keep these ready:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              {checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Talk to our partner CA — same-day response
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Email{" "}
            <a
              className="font-medium text-blue-700 underline"
              href={`mailto:ca@lastminuteitr.com?subject=${encodeURIComponent(
                `${form} filing help`
              )}`}
            >
              ca@lastminuteitr.com
            </a>{" "}
            with your form ({form}). We route complex cases to vetted CAs — no
            spam, no lead-selling, just filing help.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`mailto:ca@lastminuteitr.com?subject=${encodeURIComponent(
              `${form} filing help`
            )}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Get CA-assisted filing
          </a>
          <Button href="/file/start" variant="outline" className="flex-1">
            Change my answers
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Prefer doing it yourself? You can also file directly on the{" "}
          <a
            href="https://www.incometax.gov.in/iec/foportal/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 underline"
          >
            Income Tax Department portal
          </a>
          {checklist ? " with the checklist above." : "."}
        </p>

        <p className="text-[11px] leading-relaxed text-slate-500">{SITE_DISCLAIMER}</p>
      </div>
    </FilingLayout>
  );
}

export default function NotYetPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <NotYetContent />
    </Suspense>
  );
}
