# Image Prompts — LastMinute ITR Marketing

Phase 5 asset spec. **Implementation:** only lightweight SVGs are shipped in-repo (`public/marketing/`). Remaining prompts are for future generation (Higgsfield, Figma, etc.) — do not add empty placeholders on the landing page.

Design palette: blue `#1D4ED8`, orange `#EA580C`, soft gradients, flat illustration (match `HeroCharacterIllustration`).

---

## 1. Hero — AI filing guide with user

| Field | Value |
|-------|--------|
| **Purpose** | Reinforce “companion, not auto-filer” on homepage hero |
| **Placement** | Homepage hero (optional; **currently using** `HeroCharacterIllustration` inline SVG — do not duplicate for LCP) |
| **Filename** | `public/marketing/hero-ai-ca-guide.webp` |
| **Aspect ratio** | 16:9 desktop; crop to 4:3 on mobile (focus characters center) |
| **Style** | Flat illustration, not photorealistic |
| **Alt text** | Illustration of a salaried professional and a filing guide preparing an income tax return together |

**Prompt:** Flat vector illustration, Indian salaried professional at laptop looking relieved, friendly filing guide character in blue pointing at Form 16 document, orange accent highlights, soft blue-orange gradient background, minimal detail, no text, no government logos, modern fintech style, white card border, 16:9.

**Mobile crop:** Keep both characters centered; crop side padding.

---

## 2. Form 16 upload

| Field | Value |
|-------|--------|
| **Purpose** | Explain import-first workflow on Form 16 landing / import step |
| **Placement** | `/form-16-filing` or import docs marketing (optional) |
| **Filename** | `public/marketing/form-16-upload.svg` ✅ **shipped** |
| **Aspect ratio** | 12:7 |
| **Style** | Flat illustration |
| **Alt text** | Form 16 PDF document with upload arrow |

**Prompt:** Minimal flat illustration of Form 16 certificate document with TDS table lines, upward upload arrow in blue, warm orange accent button, light cream background, no readable personal data, clean fintech aesthetic.

---

## 3. Old vs new regime

| Field | Value |
|-------|--------|
| **Purpose** | Visual for regime comparison content |
| **Placement** | `/old-vs-new-regime` SEO landing, learn article sidebar |
| **Filename** | `public/marketing/old-vs-new-regime.webp` |
| **Aspect ratio** | 3:2 |
| **Style** | Split-panel illustration |
| **Alt text** | Side-by-side comparison of old and new tax regime choices |

**Prompt:** Split-screen flat illustration, left panel “old regime” with small icons for 80C piggy bank HRA house, right panel “new regime” with simpler slab ladder and standard deduction badge, Indian rupee motif subtle, blue and orange brand colors, no misleading “always better” labels.

---

## 4. Government portal guide

| Field | Value |
|-------|--------|
| **Purpose** | Portal companion section — copy values to incometax.gov.in |
| **Placement** | `PortalCompanionSection` ✅ **wired** via `ImageBlock` |
| **Filename** | `public/marketing/portal-guide.svg` ✅ **shipped** |
| **Aspect ratio** | 3:2 |
| **Style** | Flat UI mock illustration (not official ITD branding) |
| **Alt text** | Copying verified tax fields to the government e-filing portal and e-verifying |

**Prompt:** Generic e-filing portal UI mockup flat illustration, green checkmark on completed fields, orange e-verify button, arrow labeled conceptually as copy from helper app, disclaimer aesthetic not official government seal.

---

## 5. Senior citizen assistance

| Field | Value |
|-------|--------|
| **Purpose** | Senior filer trust on learn hub / senior article |
| **Placement** | `/learn/senior-citizen-80ttb` header (future) |
| **Filename** | `public/marketing/senior-citizen-assist.webp` |
| **Aspect ratio** | 4:3 |
| **Style** | Warm, accessible illustration |
| **Alt text** | Senior citizen reviewing pension and bank interest documents with family assistance |

**Prompt:** Warm flat illustration, Indian senior couple at dining table with pension slip and bank FD statement, younger family member pointing helpfully, calm blue-orange palette, large readable documents, respectful tone, no medical imagery.

---

## 6. AIS / 26AS mismatch

| Field | Value |
|-------|--------|
| **Purpose** | Pain point — Form 16 alone is incomplete |
| **Placement** | `PainPointSection` ✅ **wired** via `ImageBlock` |
| **Filename** | `public/marketing/ais-mismatch.svg` ✅ **shipped** |
| **Aspect ratio** | 12:7 |
| **Style** | Flat diagram |
| **Alt text** | Form 16 and AIS statements compared with a warning on missing interest income |

**Prompt:** Two document panels Form 16 vs AIS, AIS panel shows extra FD interest lines highlighted amber warning icon, flat fintech infographic, blue orange colors, educational not alarming.

---

## 7. Payment / trust

| Field | Value |
|-------|--------|
| **Purpose** | Checkout trust — Razorpay, no fake guarantees |
| **Placement** | Pricing / checkout marketing strip (future) |
| **Filename** | `public/marketing/payment-trust.webp` |
| **Aspect ratio** | 2:1 banner |
| **Style** | Minimal icons, realistic payment UI avoided — illustration only |
| **Alt text** | Secure payment for unlocking the filing companion guide |

**Prompt:** Flat illustration secure payment lock icon, UPI card razorpay-style generic checkout without brand logos, shield checkmark, blue primary orange accent, text-free, trustworthy fintech.

---

## 8. Blog cover template

| Field | Value |
|-------|--------|
| **Purpose** | OG/social cover for learn & blog posts |
| **Placement** | Default OG image generator or per-article override |
| **Filename** | `public/marketing/blog-cover-template.webp` |
| **Aspect ratio** | 1200×630 (1.91:1) |
| **Style** | Template with title safe area |
| **Alt text** | LastMinute ITR guide cover |

**Prompt:** Blog cover template, left third blue gradient with abstract document icons, right area light cream empty space for title overlay, small LastMinute ITR wordmark area bottom-left, modern Indian fintech, no stock photos.

---

## 9. Empty state

| Field | Value |
|-------|--------|
| **Purpose** | No documents imported yet in file flow |
| **Placement** | Import documents empty state (future UI) |
| **Filename** | `public/marketing/empty-state-documents.svg` |
| **Aspect ratio** | 1:1 |
| **Style** | Friendly illustration |
| **Alt text** | No documents uploaded yet — start with Form 16 |

**Prompt:** Friendly flat empty folder illustration, dashed outline Form 16 and AIS icons floating, blue orange palette, encouraging not error-red, minimal.

---

## 10. Error / retry

| Field | Value |
|-------|--------|
| **Purpose** | Parse failure / network retry |
| **Placement** | Import error state (future UI) |
| **Filename** | `public/marketing/error-retry.svg` |
| **Aspect ratio** | 1:1 |
| **Style** | Soft error (amber, not aggressive red) |
| **Alt text** | Something went wrong — try uploading Form 16 again |

**Prompt:** Flat illustration document with gentle amber warning triangle, circular retry arrow, calm blue background, supportive tone, no scary crash imagery.

---

## Phase 5 implementation summary

| Asset | Shipped | Wired on site |
|-------|---------|---------------|
| `portal-guide.svg` | ✅ | `PortalCompanionSection` |
| `ais-mismatch.svg` | ✅ | `PainPointSection` |
| `form-16-upload.svg` | ✅ | Available for future pages |
| Hero | Uses existing `HeroCharacterIllustration` | Homepage (no LCP image load) |

**Component:** `components/marketing/ImageBlock.tsx` — returns `null` if file missing (no blank boxes).

**Rule:** Do not use `ImagePlaceholder` on landing when asset absent.
