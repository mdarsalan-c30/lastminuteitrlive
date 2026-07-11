"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PortalFootprintScreen, PortalForm } from "@/lib/engine/types";
import { displayValue } from "@/lib/format";
import { PortalCaBanner } from "@/components/filing/companion/PortalCaBanner";
import { Check, Copy, ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const ITD_URL = "https://www.incometax.gov.in/iec/foportal/";

interface PortalParallelMirrorProps {
  form: PortalForm;
  screens: PortalFootprintScreen[];
  exportUnlocked: boolean;
}

function actionBadge(action: string): string {
  switch (action) {
    case "enter":
      return "bg-emerald-100 text-emerald-800";
    case "verify":
      return "bg-blue-100 text-blue-800";
    case "skip":
      return "bg-slate-100 text-slate-600";
    case "deselect":
      return "bg-amber-100 text-amber-800";
    case "select_no":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function actionLabel(action: string): string {
  switch (action) {
    case "enter":
      return "Copy this value";
    case "verify":
      return "Check on portal";
    case "skip":
      return "Skip if not applicable";
    case "deselect":
      return "Turn off on portal";
    case "select_no":
      return "Select No";
    default:
      return action;
  }
}

export function PortalParallelMirror({
  form,
  screens,
  exportUnlocked,
}: PortalParallelMirrorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const enterFields = useMemo(
    () =>
      screens.flatMap((s) =>
        s.fields
          .filter((f) => f.action === "enter" && f.ourValueKey)
          .map((f) => ({ screen: s, field: f }))
      ),
    [screens]
  );

  const copyValue = useCallback(
    async (key: string, value: string | number | null) => {
      if (!exportUnlocked || value == null) return;
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    },
    [exportUnlocked]
  );

  return (
    <div className="space-y-4">
      <PortalCaBanner>
        Open{" "}
        <a
          href={ITD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0e5f63] underline underline-offset-2"
        >
          incometax.gov.in
        </a>{" "}
        in a new tab beside this screen. Each section below matches a screen on
        the government portal — expand a section, copy our number, paste it in
        the same place on the portal, then tick it off here.
      </PortalCaBanner>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-700">
          <strong>{screens.length}</strong> portal sections ·{" "}
          <strong>{enterFields.length}</strong> values to copy for {form}
        </p>
        <a
          href={ITD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e5f63] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0a4a4d]"
        >
          Open IT portal
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {!exportUnlocked && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="size-3.5" />
          Pay to unlock copy-ready numbers. Section names and instructions are
          free.
        </p>
      )}

      <Accordion
        multiple
        defaultValue={screens.slice(0, 2).map((s) => s.id)}
        className="space-y-2"
      >
        {screens.map((screen, si) => {
          const pasteCount = screen.fields.filter((f) => f.action === "enter").length;
          return (
            <AccordionItem
              key={screen.id}
              value={screen.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white px-0"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50/80">
                <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
                  <span className="text-xs font-medium text-slate-500">
                    Section {si + 1} · {screen.portalPath}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {screen.portalScreenTitle ?? screen.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {pasteCount} field{pasteCount !== 1 ? "s" : ""} to enter
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-slate-100 px-4 pb-4 pt-3">
                {screen.screenTips?.length ? (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
                    {screen.screenTips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : null}
                {screen.warnings?.length ? (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-xs text-amber-800">
                    {screen.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="space-y-3">
                  {screen.fields.map((field, fi) => {
                    const key = `${screen.id}-${fi}`;
                    const showValue =
                      field.action === "enter" && field.ourValue != null;
                    return (
                      <div
                        key={key}
                        className={cn(
                          "rounded-lg border p-3",
                          field.action === "skip"
                            ? "border-slate-100 bg-slate-50/50"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {field.label}
                            </p>
                            {field.plainEnglishWhy && (
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {field.plainEnglishWhy}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                              actionBadge(field.action)
                            )}
                          >
                            {actionLabel(field.action)}
                          </span>
                        </div>

                        {showValue && (
                          <div className="mt-2 flex items-center gap-2">
                            <code
                              className={cn(
                                "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums",
                                exportUnlocked
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border-slate-200 bg-slate-100 text-slate-400 blur-sm select-none"
                              )}
                            >
                              {exportUnlocked
                                ? displayValue(field.ourValue)
                                : "••••••"}
                            </code>
                            <button
                              type="button"
                              disabled={!exportUnlocked}
                              onClick={() => copyValue(key, field.ourValue ?? null)}
                              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                              aria-label={`Copy ${field.label}`}
                            >
                              {copiedKey === key ? (
                                <Check className="size-4 text-emerald-600" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
