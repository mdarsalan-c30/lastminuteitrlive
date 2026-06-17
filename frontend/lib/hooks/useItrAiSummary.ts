"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildAnalyticsRows } from "@/lib/itr/buildAnalyticsRows";
import type {
  ItrSummaryPayload,
  ItrSummaryRequest,
} from "@/lib/itr/summaryTypes";
import type { LastParseResult } from "@/lib/store/draft";
import type { DeductionDraft, IncomeDraft } from "@/lib/store/draft";

export interface UseItrAiSummaryInput {
  income: IncomeDraft;
  deductions: DeductionDraft;
  lastParseResult: LastParseResult | null;
  connectedConnectors: string[];
  taxSnapshot?: ItrSummaryRequest["taxSnapshot"];
  enabled?: boolean;
}

export function useItrAiSummary({
  income,
  deductions,
  lastParseResult,
  connectedConnectors,
  taxSnapshot,
  enabled = true,
}: UseItrAiSummaryInput) {
  const [aiSummary, setAiSummary] = useState<ItrSummaryPayload | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const lastFetchKey = useRef<string>("");

  const rows = useMemo(
    () =>
      buildAnalyticsRows({
        income,
        deductions,
        lastParseResult,
        connectedConnectors,
      }),
    [income, deductions, lastParseResult, connectedConnectors]
  );

  const fetchKey = useMemo(
    () =>
      JSON.stringify({
        rows,
        parsedAt: lastParseResult?.parsedAt,
        taxSnapshot,
      }),
    [rows, lastParseResult?.parsedAt, taxSnapshot]
  );

  const refreshSummary = useCallback(async () => {
    if (!enabled || rows.length === 0) return;

    setAiLoading(true);
    try {
      const body: ItrSummaryRequest = {
        rows,
        parseMeta: lastParseResult
          ? {
              connectorId: lastParseResult.connectorId,
              parseMode: lastParseResult.mode,
              demo: lastParseResult.demo,
              warnings: lastParseResult.warnings,
            }
          : undefined,
        taxSnapshot,
      };

      const res = await fetch("/api/itr/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        summary: ItrSummaryPayload | null;
        aiEnabled: boolean;
      };
      setAiEnabled(data.aiEnabled);
      setAiSummary(data.summary);
    } catch {
      setAiSummary(null);
    } finally {
      setAiLoading(false);
    }
  }, [enabled, rows, lastParseResult, taxSnapshot]);

  useEffect(() => {
    if (!enabled || !lastParseResult?.parsedAt) return;
    if (fetchKey === lastFetchKey.current) return;
    lastFetchKey.current = fetchKey;
    void refreshSummary();
  }, [enabled, fetchKey, lastParseResult?.parsedAt, refreshSummary]);

  return {
    aiSummary,
    aiLoading,
    aiEnabled,
    refreshSummary,
  };
}
