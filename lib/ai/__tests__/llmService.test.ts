import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  __resetRateLimitForTests,
  completeJson,
  isAnyLlmConfigured,
} from "../llmService";

const testSchema = z.object({
  message: z.string(),
});

describe("llmService", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    __resetRateLimitForTests();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_PROVIDER;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("returns fallback when no provider keys configured", async () => {
    expect(isAnyLlmConfigured()).toBe(false);

    const result = await completeJson({
      schema: testSchema,
      systemPrompt: "sys",
      userPrompt: "user",
      routeKey: "test",
    });

    expect(result).toEqual({
      ok: false,
      error: "No AI provider configured",
      fallback: true,
    });
  });

  it("validates JSON against schema", async () => {
    process.env.AI_API_KEY = "test-key";
    process.env.AI_PROVIDER = "openai";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ message: "hello" }) } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson({
      schema: testSchema,
      systemPrompt: "sys",
      userPrompt: "user",
      routeKey: "test-schema",
      clientIp: "127.0.0.1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.message).toBe("hello");
    }
  });

  it("rejects blocklisted phrases in output", async () => {
    process.env.AI_API_KEY = "test-key";
    process.env.AI_PROVIDER = "openai";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message: "We guarantee refund for everyone",
                }),
              },
            },
          ],
        }),
      })
    );

    const result = await completeJson({
      schema: testSchema,
      systemPrompt: "sys",
      userPrompt: "user",
      routeKey: "test-blocklist",
      clientIp: "127.0.0.2",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fallback).toBe(true);
      expect(result.error).toContain("disallowed");
    }
  });

  it("retries on provider HTTP error then succeeds", async () => {
    process.env.AI_API_KEY = "test-key";
    process.env.AI_PROVIDER = "openai";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => "unavailable",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ message: "ok" }) } }],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson({
      schema: testSchema,
      systemPrompt: "sys",
      userPrompt: "user",
      routeKey: "test-retry",
      clientIp: "127.0.0.3",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it("returns fallback on timeout", async () => {
    process.env.AI_API_KEY = "test-key";
    process.env.AI_PROVIDER = "openai";
    process.env.AI_TIMEOUT_MS = "50";

    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          })
      )
    );

    const result = await completeJson({
      schema: testSchema,
      systemPrompt: "sys",
      userPrompt: "user",
      routeKey: "test-timeout",
      clientIp: "127.0.0.4",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fallback).toBe(true);
      expect(result.error.toLowerCase()).toContain("timed out");
    }
  });
});
