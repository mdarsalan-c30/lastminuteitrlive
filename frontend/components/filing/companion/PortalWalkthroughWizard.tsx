"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Monitor,
} from "lucide-react";
import type { ITRResult, PortalForm, UserInput } from "@/lib/engine/types";
import { displayValue } from "@/lib/format";
import { Button } from "@/components/filing/ui";
import { cn } from "@/lib/utils";
import {
  getPortalWalkthrough,
  ITD_PORTAL_URL,
  resolveWalkthroughValue,
  walkthroughImageUrl,
  type WalkthroughChapter,
  type WalkthroughStepAction,
} from "@/lib/filing/portalWalkthrough";

interface PortalWalkthroughWizardProps {
  form: PortalForm;
  exportUnlocked: boolean;
  result?: ITRResult | null;
  userInput?: UserInput;
  /** When true, show form-mismatch banner (e.g. recommended ITR-2 but viewing ITR-1 guide). */
  formMismatch?: boolean;
  recommendedForm?: string;
}

function actionLabel(action: WalkthroughStepAction): string {
  switch (action) {
    case "click":
      return "Click";
    case "enter":
      return "Enter";
    case "verify":
      return "Verify";
    case "skip":
      return "Skip if N/A";
    case "note":
      return "Note";
    default:
      return "Do this";
  }
}

function actionClass(action: WalkthroughStepAction): string {
  switch (action) {
    case "click":
      return "bg-teal-100 text-teal-800";
    case "enter":
      return "bg-emerald-100 text-emerald-800";
    case "verify":
      return "bg-blue-100 text-blue-800";
    case "skip":
      return "bg-slate-100 text-slate-700";
    case "note":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function ChapterScreenshot({
  url,
  alt,
}: {
  url?: string;
  alt: string;
}) {
  if (!url) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Monitor className="size-8 text-slate-400" aria-hidden />
        <p className="text-sm font-medium text-slate-700">
          Portal screenshot coming soon
        </p>
        <p className="max-w-xs text-xs text-slate-500">
          Follow the click path on incometax.gov.in. Visual screenshots for this
          form arrive with the intern Word pack.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      <Image
        src={url}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 1024px) 100vw, 560px"
        className="object-contain object-top"
      />
    </div>
  );
}

export function PortalWalkthroughWizard({
  form,
  exportUnlocked,
  result,
  userInput,
  formMismatch,
  recommendedForm,
}: PortalWalkthroughWizardProps) {
  const walkthrough = useMemo(() => getPortalWalkthrough(form), [form]);
  const chapters = walkthrough.chapters;
  const [index, setIndex] = useState(0);
  const chapter: WalkthroughChapter | undefined = chapters[index];
  const total = chapters.length;

  const heroUrl = walkthroughImageUrl(
    form,
    chapter?.heroImage ?? chapter?.steps.find((s) => s.image)?.image
  );

  if (!chapter) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No walkthrough chapters for {form}.
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      {formMismatch && (
        <div
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">
              Your return looks like {recommendedForm ?? "another form"}
            </p>
            <p className="mt-1 text-amber-900/90">
              This picture guide is for {form}. Use the ITR form selector above
              to switch, or stay only if you are sure the portal form matches.
            </p>
          </div>
        </div>
      )}

      {!walkthrough.hasScreenshots && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <strong className="text-slate-800">{form} text guide.</strong>{" "}
          Screenshot pages will match ITR-1 quality after the intern Word file
          for this form is added under{" "}
          <code className="rounded bg-white px-1">public/portal/</code>.
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page {index + 1} of {total} · {walkthrough.assessmentYear}
          </p>
          <p className="text-sm font-semibold text-slate-900">{chapter.title}</p>
          <p className="text-xs text-slate-600">{chapter.subtitle}</p>
        </div>
        <a
          href={walkthrough.portalUrl || ITD_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e5f63] px-4 text-sm font-semibold text-white hover:bg-[#0a4a4d]"
        >
          Open Income Tax portal
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
              i === index
                ? "bg-[#0e5f63] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {i + 1}. {c.title.split("·")[0].trim().slice(0, 18)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChapterScreenshot url={heroUrl} alt={`${chapter.title} portal screen`} />

        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500">
            Portal path:{" "}
            <span className="text-slate-800">{chapter.portalPath}</span>
          </p>

          {(chapter.tips?.length ?? 0) > 0 && (
            <ul className="space-y-1 rounded-lg bg-teal-50/80 px-3 py-2 text-xs text-teal-900">
              {chapter.tips!.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          )}

          {(chapter.warnings?.length ?? 0) > 0 && (
            <ul className="space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {chapter.warnings!.map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}

          <ol className="space-y-3">
            {chapter.steps.map((step) => {
              const stepImage = walkthroughImageUrl(form, step.image);
              const value = exportUnlocked
                ? resolveWalkthroughValue(step.ourValueKey, result, userInput)
                : null;
              return (
                <li
                  key={step.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        actionClass(step.action)
                      )}
                    >
                      {actionLabel(step.action)}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {step.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {step.clickPath}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{step.plainEnglish}</p>
                  {step.hindiShort && (
                    <p className="mt-0.5 text-xs text-slate-500">{step.hindiShort}</p>
                  )}
                  {step.tip && (
                    <p className="mt-1 text-xs text-teal-800">{step.tip}</p>
                  )}
                  {step.warning && (
                    <p className="mt-1 text-xs font-medium text-amber-800">
                      {step.warning}
                    </p>
                  )}
                  {step.ourValueKey && (
                    <p className="mt-2 text-sm">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Your number{" "}
                      </span>
                      {exportUnlocked && value != null ? (
                        <span className="font-semibold text-[#0e5f63]">
                          {displayValue(value)}
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-400 blur-[3px] select-none">
                          ₹••••
                        </span>
                      )}
                    </p>
                  )}
                  {stepImage && stepImage !== heroUrl && (
                    <div className="relative mt-2 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-100">
                      <Image
                        src={stepImage}
                        alt={step.title}
                        fill
                        unoptimized
                        className="object-contain object-top"
                        sizes="(max-width: 1024px) 100vw, 280px"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="mr-1 size-4" aria-hidden />
          Back
        </Button>
        <p className="text-xs text-slate-500">
          Keep the portal open · we guide, you file
        </p>
        <Button
          variant="primary"
          className="min-h-11"
          disabled={index >= total - 1}
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        >
          Next
          <ChevronRight className="ml-1 size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
