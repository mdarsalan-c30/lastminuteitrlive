"use client";

import { useCallback, useRef, useState } from "react";
import { computeUserInput } from "@/lib/engine/computeService";
import { trackEngineEvent } from "@/lib/monitoring/events";
import type { ComputeResponse, ITRResult, UserInput } from "@/lib/engine/types";

export interface UseTaxComputeState {
  loading: boolean;
  error: string | null;
  engineUnavailable: boolean;
  data: ComputeResponse | null;
  result: ITRResult | null;
  lastSnapshot: ITRResult | null;
  handoff: Record<string, unknown> | null;
  compute: (input: UserInput) => Promise<ComputeResponse>;
  reset: () => void;
}

export function useTaxCompute(): UseTaxComputeState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineUnavailable, setEngineUnavailable] = useState(false);
  const [data, setData] = useState<ComputeResponse | null>(null);
  const [handoff, setHandoff] = useState<Record<string, unknown> | null>(null);
  const lastSnapshotRef = useRef<ITRResult | null>(null);
  const [lastSnapshot, setLastSnapshot] = useState<ITRResult | null>(null);

  const compute = useCallback(async (input: UserInput) => {
    const startedAt = Date.now();
    setLoading(true);
    setError(null);
    setEngineUnavailable(false);
    try {
      const serviceResult = await computeUserInput(input);
      const response: ComputeResponse = serviceResult.raw ?? {
        ok: !serviceResult.error,
        result: serviceResult.result ?? undefined,
        handoff: serviceResult.handoff ?? undefined,
        error: serviceResult.error ?? undefined,
        code: serviceResult.engineUnavailable ? "ENGINE_UNAVAILABLE" : undefined,
      };

      if (serviceResult.error) {
        setEngineUnavailable(serviceResult.engineUnavailable);
        setError(serviceResult.error);
        setHandoff(serviceResult.handoff);
        setData(response);
        trackEngineEvent("compute_failure", {
          source: "client",
          error: serviceResult.error,
          engineUnavailable: serviceResult.engineUnavailable,
          durationMs: Date.now() - startedAt,
        });
        return response;
      }

      if (serviceResult.result) {
        lastSnapshotRef.current = serviceResult.result;
        setLastSnapshot(serviceResult.result);
      }
      setHandoff(serviceResult.handoff);
      setData(response);
      return response;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Network error";
      setError(message);
      trackEngineEvent("compute_failure", {
        source: "client",
        error: message,
        durationMs: Date.now() - startedAt,
      });
      const fail: ComputeResponse = { ok: false, error: message };
      setData(fail);
      setHandoff(null);
      return fail;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setEngineUnavailable(false);
    setHandoff(null);
    setLoading(false);
    lastSnapshotRef.current = null;
    setLastSnapshot(null);
  }, []);

  return {
    loading,
    error,
    engineUnavailable,
    data,
    result: data?.result ?? null,
    lastSnapshot,
    handoff,
    compute,
    reset,
  };
}
