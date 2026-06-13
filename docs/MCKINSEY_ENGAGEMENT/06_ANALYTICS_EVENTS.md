# 06 — Companion Analytics Events (Field-Error Rate)

**Workstream:** WS5 — Growth Readiness & Instrumentation  
**Success metric:** Field-error rate — proxy for users entering values in the wrong portal field or misunderstanding skip/deselect/select-no guidance.  
**Provider:** PostHog via `trackEvent()` → `createPostHogProvider()` when `NEXT_PUBLIC_POSTHOG_KEY` is set; no-op otherwise.

---

## Event catalog

### `companion_footprint_step_viewed`

Fires when the user views a portal footprint screen (initial mount and on Previous/Next navigation).

| Property | Type | Description |
|----------|------|-------------|
| `form` | string | ITR form (`ITR-1`, `ITR-3`, `ITR-4`) |
| `screenId` | string | Stable screen id from `portal_footprint.json` |
| `screenIndex` | number | Zero-based index in the wizard (0 = first screen) |

**PostHog use:** Funnel denominator — unique users per screen; drop-off between screens.

---

### `companion_field_action`

Fires once per field when its screen is viewed. Records the prescribed portal action and whether a copyable value was shown.

| Property | Type | Description |
|----------|------|-------------|
| `form` | string | ITR form |
| `screenId` | string | Parent screen id |
| `fieldLabel` | string | Human-readable portal field label |
| `action` | string | `enter` \| `skip` \| `deselect` \| `select_no` |
| `hadCopyValue` | boolean | `true` when field had a copy button (enter + non-null value) |

**PostHog use:** Segment confusion by action type; correlate `select_no` / `deselect` fields with `companion_field_confusion`.

---

### `companion_field_copy`

Fires when the user copies a value from the wizard to clipboard.

| Property | Type | Description |
|----------|------|-------------|
| `form` | string | ITR form |
| `screenId` | string | Parent screen id |
| `fieldLabel` | string | Field whose value was copied |

**PostHog use:** Numerator signal for engaged, correct-path behavior; low copy rate on `enter` fields may indicate field-error risk.

---

### `companion_field_confusion`

Fires when the user signals confusion — either marks “entered wrong field” on a field or clicks screen-level help.

| Property | Type | Description |
|----------|------|-------------|
| `form` | string | ITR form |
| `screenId` | string | Parent screen id |
| `reason` | string | `wrong_field` \| `help` |
| `fieldLabel` | string | Present when `reason` is `wrong_field`; omitted for screen help |

**PostHog use:** Primary numerator for field-error rate.

---

### `companion_wizard_completed`

Fires once when the user has viewed every footprint screen for the form (all `screenId`s in the visited set).

| Property | Type | Description |
|----------|------|-------------|
| `form` | string | ITR form |
| `screenCount` | number | Total screens in the wizard |

**PostHog use:** M3 completion proxy — `companion_wizard_completed` ÷ unlocked companion users.

---

## Field-error rate (dashboard formula)

**Definition (hypothesis to validate in Sprint 0):**

```
field_error_rate =
  count(distinct users with ≥1 companion_field_confusion)
  ÷
  count(distinct users with ≥1 companion_footprint_step_viewed)
```

**Supporting breakdowns:**

| Insight | PostHog query |
|---------|----------------|
| Confusion by action type | `companion_field_confusion` joined to preceding `companion_field_action.action` |
| Wrong-field vs help | Filter `companion_field_confusion` by `reason` |
| Copy without confusion | Users with `companion_field_copy` and no `companion_field_confusion` |
| Screen drop-off | Funnel on `companion_footprint_step_viewed` by `screenIndex` |

---

## Implementation map

| Event | Source file |
|-------|-------------|
| All footprint events | `components/filing/companion/PortalFootprintWizard.tsx` |
| Wizard mount / form context | `app/file/companion/page.tsx` (passes `form`, `screens`; `key` resets on form change) |
| Provider wiring | `components/AnalyticsProvider.tsx`, `lib/analytics/posthog.ts` |

---

## Privacy

- No PAN, email, phone, or field **values** are sent — only labels, action types, and screen ids.
- `sanitizeProps()` in `lib/analytics/posthog.ts` strips known PII keys before PostHog capture.

---

## Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | No | When unset, `trackEvent()` queues locally and provider is no-op |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Defaults to `https://us.i.posthog.com` |
