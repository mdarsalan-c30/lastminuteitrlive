# MCKINSEY WS-B — Companion & Digital Footprint Delivery

## Scope delivered

- Implemented a portal "digital footprint" layer for companion filing so users can follow incometax.gov.in screen-by-screen.
- Extended portal guide response model with structured screen metadata and field-level actions.
- Added a mobile-first companion wizard for the ITR-1 salary + deductions path.
- Extended footprint wizard to **ITR-2**, **ITR-3**, and **ITR-4** with form-specific portal screens.
- Wired live values from compute result + draft-derived input into field rows with copy-to-clipboard actions.

## What was built

### 1) Data model extension

Added new types in `lib/engine/types.ts`:

- `PortalFieldAction`: `enter | skip | deselect | select_no`
- `PortalScreenField` with:
  - `label`
  - `ourValueKey`
  - `action`
  - `copyValue`
  - `plainEnglishWhy`
  - `ourValue` (resolved server-side)
- `PortalFootprintScreen` with:
  - `portalScreenTitle`
  - `portalPath`
  - `fields[]`
  - `warnings[]`
- `PortalGuideResponse.footprintScreens`

### 2) Footprint content dataset

`data/portal_footprint.json` portal screens by form:

| Form | Screens | Coverage |
|------|---------|----------|
| **ITR-1** | 2 | Salary, Chapter VI-A deductions |
| **ITR-2** | 5 | Salary (skip if N/A), Schedule CG, Schedule OS, deductions, Part D tax |
| **ITR-3** | 6 | Schedule BP (books P&L), Schedule CG (skip if N/A), salary (mixed), deductions, Part A-BS skip guidance, Part D tax |
| **ITR-4** | 4 | Presumptive 44AD/44ADA, salary (mixed), deductions, Part D tax |

Each screen includes:

- `portalScreenTitle` and `portalPath` matching incometax.gov.in navigation
- Field rows with `enter`, `skip`, `deselect`, or `select_no` actions
- `ourValueKey` paths resolved via `mergePortalFootprint` (engine result + user input)
- `plainEnglishWhy` rationale and per-screen `warnings`

**ITR-1** (original delivery):

- Salary screen: gross salary, exempt allowances, standard deduction, professional tax, skip-only agricultural income
- Deductions screen: 80C, 80D, 80CCD(1B), 80CCD(2), 80G, `select_no` / `deselect` examples

**ITR-2** highlights:

- Skip entire salary schedule when gross salary is zero
- Schedule CG with STCG 111A, LTCG 112A, other CG; skip presumptive business and Schedule FA when not applicable
- Schedule OS interest/dividend rows; Part D tax with TDS and advance tax keys

**ITR-3** highlights:

- Books P&L path (`business.*`, `business_income.*`); skip 44AD/44ADA presumptive fields
- Balance sheet screen — all fields `skip` with plain-English note that engine does not compute Part A-BS yet

**ITR-4** highlights:

- Presumptive 44AD/44ADA turnover and income; skip detailed P&L and unsupported 44AE
- Mixed salary path with skip-all guidance; Part D includes skip for Schedule CG (wrong form)

`data/portal_steps.json` checklist steps: ITR-1 (50), ITR-2 (53), ITR-3 (57), ITR-4 (56). Generated via `scripts/generate_portal_steps.py`.

### 3) Live-value server wiring

Updated `app/api/portal-guide/[form]/route.ts`:

- Loads footprint dataset for the selected form.
- Resolves each field’s `ourValue` using existing engine resolver.
- Returns merged `footprintScreens` along with existing table steps.

Updated `lib/engine/mergeValues.ts`:

- Added `mergePortalFootprint(...)` to resolve live values for each field key.

### 4) Companion UI wizard

Added `components/filing/companion/PortalFootprintWizard.tsx`:

- Screen-by-screen wizard matching portal order.
- Per field:
  - Action badge (`Enter this`, `Skip this`, `Deselect this`, `Select No`)
  - “Your number” panel from live values
  - Copy button for enterable values
  - Plain-English rationale
- Side panel with per-screen warnings.
- Previous/Next navigation and responsive mobile-first layout.
- Exhaustive switch handling for action labels/styles.

Updated `app/file/companion/page.tsx`:

- Renders wizard above legacy checklist when footprint data is available for the user's form (ITR-1 through ITR-4)
- Keeps existing `PortalGuideTable` fallback and full checklist behavior intact.

## Demo path

- `/file/companion`

## Notes

- ITR-1 footprint covers salary + deductions; ITR-2/3/4 add form-specific income schedules and Part D tax verification.
- Balance sheet (ITR-3 Part A-BS) is documented as skip-only until engine support ships.
- Existing table-based checklist remains functional for complete filing coverage.
