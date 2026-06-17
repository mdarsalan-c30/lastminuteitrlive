import type { FieldConfidence } from "@/lib/store/draft";

export interface AnalyticsRow {
  category: string;
  particular: string;
  amount: number | null;
  source: string;
  confidence?: FieldConfidence;
  insight?: string;
}

export interface ItrSummaryFlag {
  type: "warning" | "info" | "success";
  text: string;
}

export interface ItrSummaryPayload {
  bullets: string[];
  flags: ItrSummaryFlag[];
  regimeHint: string | null;
  rowInsights: Record<string, string>;
}

export interface ItrSummaryResponse {
  summary: ItrSummaryPayload | null;
  aiEnabled: boolean;
  fallback: boolean;
  message?: string;
}

export interface ItrSummaryRequest {
  rows: AnalyticsRow[];
  parseMeta?: {
    connectorId?: string;
    parseMode?: string;
    demo?: boolean;
    warnings?: string[];
    employer?: string;
  };
  taxSnapshot?: {
    recommendedRegime?: string;
    taxOld?: number;
    taxNew?: number;
    taxSaving?: number;
    refundEstimate?: number;
  };
}
