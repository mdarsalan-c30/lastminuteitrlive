"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import { generateFollowUpQuestions } from "@/lib/engine/questionEngine";
import type { FollowUpQuestion } from "@/lib/engine/questionEngine";
import { buildRecommendationBundle } from "@/lib/engine/recommendationEngine";
import type { RecommendationBundle } from "@/lib/engine/recommendationEngine";
import {
  createDebounced,
  RECOMPUTE_DEBOUNCE_MS,
} from "@/lib/engine/recomputeService";
import { useTaxCompute } from "@/lib/hooks/useTaxCompute";
import { fallbackConfidenceFromDraft } from "@/lib/filing/confidence";
import { useDraftStore } from "@/lib/store/draft";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import type { ConfidenceResult, ITRResult, UserInput } from "@/lib/engine/types";

export interface UseDraftTaxComputeResult {
  loading: boolean;
  error: string | null;
  engineUnavailable: boolean;
  isEstimated: boolean;
  result: ITRResult | null;
  lastSnapshot: ITRResult | null;
  confidence: ConfidenceResult;
  regimeSavings: number;
  userInput: ReturnType<typeof draftToUserInput>;
  compute: ReturnType<typeof useTaxCompute>["compute"];
  handoff: Record<string, unknown> | null;
  questions: FollowUpQuestion[];
  recommendations: RecommendationBundle | null;
}

export function useDraftTaxCompute(options?: { readOnly?: boolean }): UseDraftTaxComputeResult {
  const filingMode = useDraftStore((s) => s.filingMode);
  const profile = useDraftStore((s) => s.profile);
  const matrix = useDraftStore((s) => s.matrix);
  const income = useDraftStore((s) => s.income);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const extraProperties = useDraftStore((s) => s.extraProperties);
  const carryForward = useDraftStore((s) => s.carryForward);
  const depreciationBlocks = useDraftStore((s) => s.depreciationBlocks);
  const deductions = useDraftStore((s) => s.deductions);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const lastParseResult = useDraftStore((s) => s.lastParseResult);
  const questionAnswers = useDraftStore((s) => s.questionAnswers);
  const recommendedForm = useDraftStore((s) => s.recommendedForm);
  const setRecommendedForm = useDraftStore((s) => s.setRecommendedForm);
  const setEngineRecommendationCount = useDraftStore(
    (s) => s.setEngineRecommendationCount
  );
  const engineRecommendationCount = useDraftStore(
    (s) => s.engineRecommendationCount
  );

  const userInput = useMemo(
    () =>
      draftToUserInput({
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
      }),
    [
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
    ]
  );

  const {
    loading,
    error,
    engineUnavailable,
    result,
    lastSnapshot,
    handoff,
    compute,
  } = useTaxCompute();

  const computeRef = useRef(compute);
  computeRef.current = compute;
  const lastLoggedResultRef = useRef<string | null>(null);

  const debouncedCompute = useMemo(
    () =>
      createDebounced((input: UserInput) => {
        void computeRef.current(input);
      }, RECOMPUTE_DEBOUNCE_MS),
    []
  );

  const [awaitingCompute, setAwaitingCompute] = useState(false);

  useEffect(() => {
    setAwaitingCompute(true);
    debouncedCompute(userInput);
    return () => debouncedCompute.cancel();
  }, [debouncedCompute, userInput]);

  useEffect(() => {
    if (!loading) {
      setAwaitingCompute(false);
    }
  }, [loading]);

  const effectiveLoading = loading || awaitingCompute;

  useEffect(() => {
    if (options?.readOnly) return;
    const count =
      result?.regime_comparison.recommended_regime === "old"
        ? result.recommendations.filter(
            (r) => !r.blocked && r.risk === "green" && r.estimated_benefit > 0
          ).length
        : 0;
    if (count !== engineRecommendationCount) {
      setEngineRecommendationCount(count);
    }
  }, [
    result,
    engineRecommendationCount,
    setEngineRecommendationCount,
    options?.readOnly,
  ]);

  useEffect(() => {
    if (options?.readOnly) return;
    if (!result) return;
    const engineForm = result.profile.itr_form;
    if (engineForm === recommendedForm) return;
    const caseId = `${engineForm}-${matrix.income}${matrix.age}-${matrix.business}`;
    setRecommendedForm(engineForm, caseId);
  }, [result, recommendedForm, matrix, setRecommendedForm, options?.readOnly]);

  useEffect(() => {
    if (options?.readOnly) return;
    if (!result) return;
    const key = `${result.profile.itr_form}:${result.regime_comparison.recommended_regime}:${result.regime_comparison[result.regime_comparison.recommended_regime].net_payable}`;
    if (lastLoggedResultRef.current === key) return;
    lastLoggedResultRef.current = key;
    void logSessionEvent("compute_complete", {
      draft: draftSnapshotForLog(useDraftStore.getState()),
      computeResult: result as unknown as Record<string, unknown>,
    });
  }, [result, options?.readOnly]);

  const fallback = useMemo(
    () =>
      fallbackConfidenceFromDraft({
        filingMode,
        mismatchResolved,
        incomeChips,
      }),
    [filingMode, mismatchResolved, incomeChips]
  );

  const hasEngineResult = result !== null;
  const isEstimated = !effectiveLoading && !hasEngineResult && error !== null;
  const confidence = hasEngineResult
    ? result.confidence
    : isEstimated
      ? {
          ...fallback,
          filing_ready: false,
          is_estimate_mode: true,
        }
      : fallback;

  const regimeSavings = useMemo(() => {
    const rc = result?.regime_comparison;
    if (!rc) return 0;
    return rc.tax_saving;
  }, [result]);

  const questions = useMemo(
    () =>
      generateFollowUpQuestions({
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
        },
        questionAnswers,
      }),
    [
      result,
      userInput,
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
      questionAnswers,
    ]
  );

  const recommendations = useMemo(
    () => (result ? buildRecommendationBundle(result, handoff) : null),
    [result, handoff]
  );

  return {
    loading: effectiveLoading,
    error,
    engineUnavailable,
    isEstimated,
    result,
    lastSnapshot,
    confidence,
    regimeSavings,
    userInput,
    compute,
    handoff,
    questions,
    recommendations,
  };
}
