# ITR-2 / ITR-3 / ITR-4 walkthrough status

## What is live now

- Same companion UI as ITR-1 (`/file/companion` → **Step guide** tab).
- Full step-by-step chapters in:
  - `frontend/data/portalWalkthrough/itr2.json` (13 chapters, 45 steps)
  - `frontend/data/portalWalkthrough/itr3.json` (15 chapters, 45 steps)
  - `frontend/data/portalWalkthrough/itr4.json` (12 chapters, 39 steps)
- `hasScreenshots: true` — portal images served from `frontend/public/portal/itr2|itr3|itr4/` (symlinked to `itr1` for shared screens).

## Regenerating after edits

```bash
node frontend/scripts/generate-itr234-walkthrough.mjs
```

The generator clones ITR-1 shared chapters (login, 26AS/AIS, regime, deductions, e-verify) and inserts form-specific income chapters.

## Future: form-specific screenshots

When intern Word packs arrive for ITR-2/3/4:

1. Extract media → `frontend/public/portal/itr2|itr3|itr4/` (replace symlinks)
2. Re-map `image` fields on form-specific steps in the generator script
3. No UI rewrite needed

Shared portal screens (login, AY, regime, e-verify) can keep reusing ITR-1 images.
