import type {
  ITRResult,
  PortalFootprintScreen,
  PortalScreenField,
  PortalStep,
  UserInput,
} from "./types";

function getByPath(obj: unknown, path: string | null): unknown {
  if (!path || !obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function formatValue(value: unknown, field: string | null): string | number | null {
  if (value === undefined || value === null) return null;
  if (field === "regime_comparison.recommended_regime") {
    return String(value) === "old" ? "Old regime (opt out of new)" : "New tax regime";
  }
  if (field === "profile.itr_form") return String(value);
  if (typeof value === "number") return Math.round(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function resolveEngineValue(
  result: ITRResult,
  userInput: UserInput | undefined,
  engineField: string | null
): string | number | null {
  if (!engineField) return null;

  if (engineField === "regime_comparison.recommended_regime_net_payable") {
    const rc = result.regime_comparison;
    const slab =
      rc.recommended_regime === "old" ? rc.old.net_payable : rc.new.net_payable;
    return Math.round(slab);
  }

  if (engineField.startsWith("taxes_paid.")) {
    const val = getByPath(userInput, engineField);
    return formatValue(val, engineField);
  }

  if (engineField.startsWith("business.") && !engineField.startsWith("business_income.")) {
    const val = getByPath(userInput, engineField);
    return formatValue(val, engineField);
  }

  const val = getByPath(result, engineField);
  return formatValue(val, engineField);
}

export function mergePortalSteps(
  steps: PortalStep[],
  result?: ITRResult,
  userInput?: UserInput,
  completedSteps: number[] = [],
  mismatches: string[] = []
): PortalStep[] {
  const completed = new Set(completedSteps);
  const mismatchSet = new Set(mismatches);

  return steps.map((step) => {
    const ourValue =
      result && step.engineField
        ? resolveEngineValue(result, userInput, step.engineField)
        : null;

    let status: PortalStep["status"] = "pending";
    if (mismatchSet.has(String(step.step)) || mismatchSet.has(step.engineField ?? "")) {
      status = "mismatch";
    } else if (completed.has(step.step)) {
      status = "done";
    }

    return { ...step, ourValue, status };
  });
}

export function countProgress(steps: PortalStep[]) {
  const done = steps.filter((s) => s.status === "done").length;
  const mismatches = steps.filter((s) => s.status === "mismatch").length;
  return { done, mismatches, total: steps.length };
}

export function mergePortalFootprint(
  screens: PortalFootprintScreen[],
  result?: ITRResult,
  userInput?: UserInput
): PortalFootprintScreen[] {
  return screens.map((screen) => ({
    ...screen,
    fields: screen.fields.map((field: PortalScreenField) => ({
      ...field,
      ourValue:
        result && field.ourValueKey
          ? resolveEngineValue(result, userInput, field.ourValueKey)
          : null,
    })),
  }));
}
