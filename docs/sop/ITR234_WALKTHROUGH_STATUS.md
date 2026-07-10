# ITR-2 / ITR-3 / ITR-4 walkthrough status

## What is live now

- Same companion UI as ITR-1 (`/file/companion` → Screen-by-screen).
- Text chapter shells generated from `portal_footprint.json` into:
  - `frontend/data/portalWalkthrough/itr2.json`
  - `frontend/data/portalWalkthrough/itr3.json`
  - `frontend/data/portalWalkthrough/itr4.json`
- `hasScreenshots: false` — placeholder pane until assets land.

## What waits on the intern

Deliver Word files (same style as `How to file ITR-1.docx`) with portal screenshots for:

1. How to file ITR-2.docx  
2. How to file ITR-3.docx  
3. How to file ITR-4.docx  

Then engineering will:

1. Extract media → `frontend/public/portal/itr2|itr3|itr4/`
2. Map images onto chapter steps in the JSON (no UI rewrite)
3. Set `hasScreenshots: true`

## Shared chapters (reuse ITR-1 media where identical)

Login, AY selection, Online mode, and Aadhaar e-verify screens are often identical across forms — we can reuse ITR-1 images for those steps when the intern pack is incomplete.
