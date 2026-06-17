/** Server-only — import from API routes and server modules only. */

import type { z } from "zod";
import { validateLlmTextFields } from "./outputValidator";
import {
  completeGeminiRaw,
  isGeminiConfigured,
} from "./providers/gemini";
import {
  completeOpenAiRaw,
  extractJsonFromContent,
  isOpenAiConfigured,
} from "./providers/openai";

export type AiProviderName = "openai" | "gemini" | "auto";

export type LlmSuccess<T> = { ok: true; data: T };
export type LlmFailure = { ok: false; error: string; fallback: true };

export interface CompleteJsonRequest<TSchema extends z.ZodType> {
  schema: TSchema;
  systemPrompt: string;
  userPrompt: string;
  routeKey?: string;
  clientIp?: string;
  /** Collect string fields from parsed JSON for blocklist validation */
  textFields?: (data: z.infer<TSchema>) => string[];
}

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getTimeoutMs(): number {
  const raw = process.env.AI_TIMEOUT_MS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_TIMEOUT_MS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function getProviderPreference(): AiProviderName {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "openai" || raw === "gemini" || raw === "auto") {
    return raw;
  }
  return "auto";
}

function resolveProviders(): AiProviderName[] {
  const pref = getProviderPreference();
  if (pref === "openai") return isOpenAiConfigured() ? ["openai"] : [];
  if (pref === "gemini") return isGeminiConfigured() ? ["gemini"] : [];

  const order: AiProviderName[] = [];
  if (isOpenAiConfigured()) order.push("openai");
  if (isGeminiConfigured()) order.push("gemini");
  return order;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

async function callProviderRaw(
  provider: AiProviderName,
  params: { systemPrompt: string; userPrompt: string; signal: AbortSignal }
): Promise<{ content: string } | { error: string }> {
  if (provider === "openai") {
    return completeOpenAiRaw(params);
  }
  return completeGeminiRaw(params);
}

async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries: number
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 400 * (attempt + 1))
        );
      }
    }
  }
  throw lastError ?? new Error("LLM request failed");
}

function collectDefaultTextFields(value: unknown): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (typeof node === "string") {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node && typeof node === "object") {
      for (const v of Object.values(node as Record<string, unknown>)) {
        walk(v);
      }
    }
  };
  walk(value);
  return out;
}

/** Reset in-memory rate limit state — for tests only. */
export function __resetRateLimitForTests(): void {
  rateLimitStore.clear();
}

export function isAnyLlmConfigured(): boolean {
  return resolveProviders().length > 0;
}

export async function completeJson<TSchema extends z.ZodType>(
  request: CompleteJsonRequest<TSchema>
): Promise<LlmSuccess<z.infer<TSchema>> | LlmFailure> {
  const providers = resolveProviders();
  if (providers.length === 0) {
    return {
      ok: false,
      error: "No AI provider configured",
      fallback: true,
    };
  }

  const rateKey = `${request.clientIp ?? "unknown"}:${request.routeKey ?? "default"}`;
  if (!checkRateLimit(rateKey)) {
    return {
      ok: false,
      error: "Rate limit exceeded",
      fallback: true,
    };
  }

  const timeoutMs = getTimeoutMs();
  let lastError = "LLM request failed";

  for (const provider of providers) {
    try {
      const raw = await withRetry(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const result = await callProviderRaw(provider, {
            systemPrompt: request.systemPrompt,
            userPrompt: request.userPrompt,
            signal: controller.signal,
          });
          if ("error" in result) {
            throw new Error(result.error);
          }
          return result.content;
        } finally {
          clearTimeout(timer);
        }
      }, MAX_RETRIES);

      const jsonText = extractJsonFromContent(raw);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        lastError = "Invalid JSON from LLM";
        continue;
      }

      const validated = request.schema.safeParse(parsed);
      if (!validated.success) {
        lastError = validated.error.message;
        continue;
      }

      const textFields = request.textFields
        ? request.textFields(validated.data)
        : collectDefaultTextFields(validated.data);
      const blockCheck = validateLlmTextFields(textFields);
      if (!blockCheck.valid) {
        lastError = blockCheck.reason;
        continue;
      }

      return { ok: true, data: validated.data };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = "AI request timed out";
      } else {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  return { ok: false, error: lastError, fallback: true };
}
