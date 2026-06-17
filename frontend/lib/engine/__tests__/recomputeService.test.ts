import { describe, expect, it, vi } from "vitest";
import {
  computeWithSnapshot,
  createDebounced,
  RECOMPUTE_DEBOUNCE_MS,
} from "../recomputeService";
import type { ComputeServiceResult } from "../computeService";
import type { UserInput } from "../types";

describe("createDebounced", () => {
  it("debounces calls until wait elapses", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = createDebounced(fn, 300);

    debounced("a");
    debounced("b");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");

    vi.useRealTimers();
  });

  it("flush runs pending call immediately", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = createDebounced(fn, 300);

    debounced("x");
    debounced.flush();
    expect(fn).toHaveBeenCalledWith("x");

    vi.useRealTimers();
  });

  it("exports default debounce interval of 300ms", () => {
    expect(RECOMPUTE_DEBOUNCE_MS).toBe(300);
  });
});

describe("computeWithSnapshot", () => {
  const before: UserInput = {
    age: 32,
    salary: { gross_salary: 1_000_000, basic_salary: 500_000 },
  };
  const after: UserInput = {
    age: 32,
    salary: { gross_salary: 1_200_000, basic_salary: 600_000 },
  };

  it("records changed top-level fields and compute result", async () => {
    const mockCompute = vi.fn(
      async (): Promise<ComputeServiceResult> => ({
        result: null,
        handoff: null,
        error: null,
        engineUnavailable: false,
      })
    );

    const { historyEntry, compute } = await computeWithSnapshot(
      before,
      after,
      "income_edit",
      mockCompute
    );

    expect(mockCompute).toHaveBeenCalledWith(after);
    expect(historyEntry.trigger).toBe("income_edit");
    expect(historyEntry.changedFields).toContain("salary");
    expect(historyEntry.beforeSnapshot).toEqual(before);
    expect(historyEntry.afterSnapshot).toEqual(after);
    expect(compute.error).toBeNull();
  });
});
