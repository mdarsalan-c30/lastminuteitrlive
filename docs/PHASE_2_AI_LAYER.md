# Phase 2 — API-ready AI layer

**Scope:** Provider-agnostic LLM architecture for LastMinute ITR. No UI wiring in this phase — API routes and client helpers only.

---

## Architecture

```
POST /api/ai/questions ──┐
POST /api/ai/explain  ───┼──► lib/ai/llmService.ts (router)
POST /api/itr/summary ───┘         │
                                   ├── openai provider (AI_API_KEY)
                                   └── gemini provider (GEMINI_API_KEY)

On failure / missing keys:
  questions → lib/ai/fallbackQuestionRules.ts → questionEngine
  explain   → lib/ai/explainFallback.ts (deterministic copy)
```

LLM output is **read-only** — questions and plain-English explanations only. Tax numbers come from the Python engine via `/api/compute`; the LLM never patches `UserInput`.

---

## Environment variables

Set on the **server only** (never `NEXT_PUBLIC_*`):

| Variable | Values | Default | Purpose |
|----------|--------|---------|---------|
| `AI_PROVIDER` | `openai` \| `gemini` \| `auto` | `auto` | Provider selection |
| `AI_API_KEY` | string | — | OpenAI-compatible API key |
| `AI_API_BASE_URL` | URL | `https://api.openai.com/v1` | OpenAI-compatible base |
| `AI_MODEL` | string | `gpt-4o-mini` | Chat completions model |
| `GEMINI_API_KEY` | string | — | Google Gemini API key |
| `GEMINI_MODEL` | string | `gemini-2.0-flash` | Gemini model id |
| `AI_TIMEOUT_MS` | number | `15000` | Per-request timeout (ms) |

### Example `.env.local`

```bash
AI_PROVIDER=auto
AI_API_KEY=sk-...
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
AI_TIMEOUT_MS=15000
```

With `AI_PROVIDER=auto`, OpenAI is tried first when `AI_API_KEY` is set; Gemini is used when OpenAI is unavailable or fails.

---

## API routes

### `POST /api/ai/questions`

**Body:** `{ draft, result?, questionAnswers? }` — validated by `aiQuestionsRequestSchema`.

**Response:**

```json
{
  "questions": [{ "id", "prompt", "whyWeAsk", "category", "priority" }],
  "source": "rules" | "rules+llm",
  "llmUsed": false,
  "fallback": true,
  "escalation": "none" | "ca_review"
}
```

Always returns rule-based questions; merges optional LLM questions when configured. Never 500 for missing AI keys.

### `POST /api/ai/explain`

**Body:** `{ type: "regime" | "deduction" | "companion", context }`.

**Response:**

```json
{
  "explain": { "title", "explanation", "bulletPoints", "escalation", "disclaimer" },
  "source": "llm" | "rules",
  "fallback": true
}
```

---

## Client helpers (Phase 3+)

`lib/ai/client.ts`:

- `fetchAiQuestions(body)` → `/api/ai/questions`
- `fetchAiExplain(body)` → `/api/ai/explain`

Not wired to filing UI in Phase 2.

---

## Guardrails

Enforced in prompts (`lib/ai/prompts/guardrails.ts`) and `lib/ai/outputValidator.ts`:

- Blocklist: guaranteed refund, loophole, file for you, government integrated
- `escalation: "ca_review"` when complexity / CA flags present
- Rate limit: 40 requests / minute / IP+route (in-memory)
- Retry: up to 2 retries per provider; timeout via `AI_TIMEOUT_MS`

---

## Files

| Path | Role |
|------|------|
| `lib/ai/llmService.ts` | Provider router, timeout, retry, rate limit, Zod validation |
| `lib/ai/providers/openai.ts` | OpenAI-compatible chat completions |
| `lib/ai/providers/gemini.ts` | Google Gemini generateContent |
| `lib/ai/schemas.ts` | Zod schemas for requests and LLM JSON |
| `lib/ai/fallbackQuestionRules.ts` | Rule-based questions wrapper |
| `lib/ai/explainFallback.ts` | Deterministic explain fallback |
| `lib/ai/prompts/*` | Prompt templates with guardrails |
| `lib/ai/generateItrSummary.ts` | Refactored to use `llmService` |
| `app/api/ai/questions/route.ts` | Questions API |
| `app/api/ai/explain/route.ts` | Explain API |
| `lib/ai/client.ts` | Thin fetch helpers for future UI |

---

## Phase 3 (not in scope)

- Wire `fetchAiQuestions` / `fetchAiExplain` into filing funnel UI
- Companion wizard LLM guidance panels
- CA Brain conversational surface
