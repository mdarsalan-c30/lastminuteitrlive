import { fetchCompute } from "./client";
import type { ComputeResponse, ITRResult, UserInput } from "./types";

const ENGINE_UNAVAILABLE_MESSAGE =
  "Tax calculation temporarily unavailable. Your progress is saved. Please try again in a moment.";

export interface ComputeServiceResult {
  result: ITRResult | null;
  handoff: Record<string, unknown> | null;
  error: string | null;
  engineUnavailable: boolean;
  raw?: ComputeResponse;
}

function normalizeComputeError(response: ComputeResponse): {
  message: string;
  engineUnavailable: boolean;
} {
  const unavailable = response.code === "ENGINE_UNAVAILABLE";
  return {
    message: unavailable
      ? ENGINE_UNAVAILABLE_MESSAGE
      : (response.error ?? "Computation failed"),
    engineUnavailable: unavailable,
  };
}

export async function computeUserInput(
  input: UserInput
): Promise<ComputeServiceResult> {
  try {
    const response = await fetchCompute(input);
    if (!response.ok) {
      const { message, engineUnavailable } = normalizeComputeError(response);
      return {
        result: response.result ?? null,
        handoff: response.handoff ?? null,
        error: message,
        engineUnavailable,
        raw: response,
      };
    }
    return {
      result: response.result ?? null,
      handoff: response.handoff ?? null,
      error: null,
      engineUnavailable: false,
      raw: response,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      result: null,
      handoff: null,
      error: message,
      engineUnavailable: false,
    };
  }
}
