/**
 * Numeric fidelity (doc 52 §2): every ₹ amount in an explanation must
 * exist in the engine trace/factset — never invented by a language model.
 */

const INR_AMOUNT_RE = /₹\s*([\d,]+(?:\.\d+)?)/g;

/** Extract integer rupee amounts from rendered text. */
export function extractInrAmounts(text: string): number[] {
  const amounts: number[] = [];
  for (const match of text.matchAll(INR_AMOUNT_RE)) {
    const raw = match[1]?.replace(/,/g, "");
    if (!raw) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) amounts.push(Math.round(n));
  }
  return amounts;
}

/** Flatten all numeric params from trace entries. */
export function amountsFromTraceParams(
  traces: Array<{ params?: Record<string, number> }>
): Set<number> {
  const set = new Set<number>();
  for (const entry of traces) {
    for (const value of Object.values(entry.params ?? {})) {
      if (typeof value === "number" && Number.isFinite(value)) {
        set.add(Math.round(value));
      }
    }
  }
  return set;
}

/**
 * Returns invented amounts (in explanation but not in allowed set).
 * Allows small formatting differences via exact integer match only.
 */
export function findInventedAmounts(
  explanationText: string,
  allowed: Set<number>
): number[] {
  const found = extractInrAmounts(explanationText);
  return found.filter((n) => !allowed.has(n));
}
