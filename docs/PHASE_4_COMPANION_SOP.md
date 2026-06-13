# Phase 4 — Companion SOP + Portal Guide Personalization

Phase 4 extends the companion filing walkthrough with a richer SOP schema, draft-aware personalization, enriched footprint data, and wizard field-level guidance. It does **not** split the `portal_steps.json` bundle (Phase 5).

## Schema (`lib/filing/portalSop.ts`)

### Screen / field model

| Field | Purpose |
|-------|---------|
| `PortalSopField.id` | Stable key for footprint ↔ SOP alignment |
| `hint.whyWeAsk` | Plain-language reason the portal asks for the value |
| `hint.validationTips` | Copy/paste and mismatch avoidance tips |
| `hint.screenshotRef` | Asset path for future portal screenshots |
| `hint.itrFormCrossLink` | ITR schedule reference (e.g. Schedule S · 1(a)) |
| `skipWhen` | Condition to hide or de-emphasize screen/field |

### Skip conditions

- `no_capital_gains` — hide CG schedules when `capital_gains` chip absent
- `no_business_income` — hide business schedules
- `no_house_property` — hide HP when property type is `none`
- `new_regime_selected` — hide screens tied to old-regime-only flows
- `no_foreign_income` — hide Schedule FA
- `no_salary_income` — hide salary schedule when no salary chip / zero gross
- `old_regime_only_deduction` — hide Chapter VI-A fields in new regime

### Personalization overlay (`PortalPersonalizationOverlay`)

Built from `PortalDraftSlice`: regime, income chips, deduction amounts, house property, payment/unlock flags, mismatch status, recommended form.

## Engine (`lib/engine/portalGuideEngine.ts`)

| Function | Role |
|----------|------|
| `buildPersonalizationOverlay(draft, options?)` | Derive overlay from draft + optional compute result |
| `shouldSkipByCondition(condition, overlay)` | Evaluate skip rules |
| `personalizeFootprintScreens(screens, overlay)` | Filter screens/fields; add tips, warnings, `personalizedWhy` |
| `personalizePortalSteps(steps, overlay)` | Append regime-aware plain English on checklist steps |
| `applyPersonalizationToGuide(guide, overlay)` | Apply both footprint + step personalization |
| `fetchPersonalizedPortalGuide(params)` | POST `/api/portal-guide/[form]` with `draft` in body |
| `fetchStaticPortalGuide(form)` | GET baseline (no draft, no merged user values) |
| `draftToPortalSlice(draft)` | Map Zustand draft → `PortalDraftSlice` |

### API flow

1. Client calls `fetchPersonalizedPortalGuide` with `draft`, `userInput`, `computeResult`.
2. API merges engine values via `mergePortalSteps` / `mergePortalFootprint`.
3. When `body.draft` is present, API applies `applyPersonalizationToGuide`.
4. Payment gate unchanged (`402` without companion access).

## Footprint data (`data/portal_footprint.json`)

ITR-1 enriched with six screens:

1. **login** — PAN, credential verification
2. **prefill** — download prefill, form selection, regime toggle
3. **salary** — Schedule S fields with `whyWeAsk`, `validationTips`, `itrFormCrossLink`
4. **deductions** — Chapter VI-A with regime-aware `skipWhen`
5. **verification** — validate + net tax sanity check
6. **submit** — submit + e-verify

Other forms retain existing screens; ITR-1 is the reference implementation for field-level guidance shape.

## UI wiring

- `app/file/companion/page.tsx` — uses `fetchPersonalizedPortalGuide` + `draftToPortalSlice` (payment gate unchanged).
- `PortalFootprintWizard.tsx` — renders `whyWeAsk`, `validationTips`, `personalizedWhy`, `screenTips`, `personalizedTips`; optional `fetchAiExplain({ type: "companion" })` on screen help with `buildExplainFallback` static fallback.

## Personalized vs static fallback

| Source | When |
|--------|------|
| **Static** | `fetchStaticPortalGuide` / GET `/api/portal-guide/[form]` — raw JSON + no draft overlay |
| **Personalized** | Paid companion POST with `draft` — filtered screens, regime tips, emphasized fields |
| **AI explain** | Optional on “Need help with this screen?” — falls back to rules if LLM unavailable |

## Tests

`lib/engine/__tests__/portalGuideEngine.test.ts` — overlay building, skip conditions, footprint filtering, full guide merge.
