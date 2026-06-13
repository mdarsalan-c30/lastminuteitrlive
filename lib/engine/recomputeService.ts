import { diffUserInputFields } from "./inputSchema";
import type { ComputeServiceResult } from "./computeService";
import { computeUserInput } from "./computeService";
import type { UserInput } from "./types";

export interface ComputeHistoryEntry {
  trigger: string;
  beforeSnapshot: unknown;
  afterSnapshot: unknown;
  changedFields: string[];
}

export interface ComputeWithSnapshotResult {
  compute: ComputeServiceResult;
  historyEntry: ComputeHistoryEntry;
}

const DEFAULT_DEBOUNCE_MS = 300;

export function createDebounced<T extends (...args: never[]) => void>(
  fn: T,
  waitMs = DEFAULT_DEBOUNCE_MS
): T & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (lastArgs) fn(...lastArgs);
      lastArgs = null;
    }, waitMs);
  }) as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  return debounced;
}

export async function computeWithSnapshot(
  before: UserInput,
  after: UserInput,
  trigger: string,
  computeFn: (input: UserInput) => Promise<ComputeServiceResult> = computeUserInput
): Promise<ComputeWithSnapshotResult> {
  const changedFields = diffUserInputFields(before, after);
  const compute = await computeFn(after);

  return {
    compute,
    historyEntry: {
      trigger,
      beforeSnapshot: before,
      afterSnapshot: after,
      changedFields,
    },
  };
}

export { DEFAULT_DEBOUNCE_MS as RECOMPUTE_DEBOUNCE_MS };
