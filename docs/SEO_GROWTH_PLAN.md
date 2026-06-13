# SEO & Blog Growth Plan — LastMinute ITR

**Date:** June 2026  
**Role:** Agent 4 — SEO & Blog Growth Audit  
**Scope:** Read-only audit of marketing/content surfaces. No app code modified.  
**Sources inspected:** `app/page.tsx`, `app/layout.tsx`, `app/learn/**`, `app/glossary/**`, `app/reviews/**`, `app/sitemap.ts`, `app/robots.ts`, `lib/content/**`, `components/marketing/**`  
**Browser check:** `https://lastminute-itr.vercel.app` → **404 DEPLOYMENT_NOT_FOUND**; local dev at `localhost:3000` verified homepage, `/learn`, `/sitemap.xml`, `/robots.txt`.

---

## Executive SEO Verdict

**Overall rating: PARTIAL**

The product has a **solid technical SEO foundation** (Next.js Metadata API, dynamic sitemap, robots rules, SSG for learn/glossary, unique per-page titles on articles/terms). However, the site is **not launch-ready for organic growth**:

- Content volume is tiny (**4 articles**, **38 glossary terms**).
- Glossary pages are **programmatic but ultra-thin** (1–2 sentences each).
- Structured data is **homepage-only** and includes **misleading aggregate ratings**.
- Internal linking and conversion paths from content → product are **weak**.
- Social/OG metadata is **generic sitewide** (no per-article OG, no images).
- Production deployment at default URL is **down**.

**Recommendation:** Fix deployment + schema accuracy first, then ship the first 25 articles before scaling glossary enrichment. Do **not** index 38 thin glossary pages aggressively until expanded to 300+ words each.

---

## SEO Approval

| Gate | Status | Notes |
|------|--------|-------|
| Crawlability (robots + sitemap) | **PASS** | `app/robots.ts` + `app/sitemap.ts` generate correctly |
| Indexable marketing routes | **PASS** | `/`, `/learn`, `/glossary`, `/reviews` allowed; `/file/*` blocked |
| Unique page titles | **PARTIAL** | Articles/terms unique; OG/Twitter inherit root defaults |
| Canonical URLs | **FAIL** | Only homepage sets `alternates.canonical` |
| Structured data | **FAIL** | Homepage only; inflated `AggregateRating`; no Article/FAQ/DefinedTerm |
| Content depth | **FAIL** | 4 articles (~400–700 words); glossary ~40–120 words/term |
| Internal linking | **PARTIAL** | Footer + header partial; no article↔glossary hub links |
| E-E-A-T / trust signals | **PARTIAL** | Reviews seeded (6); no author, dates on schema, or legal pages |
| Production live | **FAIL** | `lastminute-itr.vercel.app` returns 404 |
| **Overall** | **PARTIAL** | Foundation yes; content + metadata + trust gaps block growth |

---

## Asset Audit

### Metadata & head tags

| Route | Title source | Description | Canonical | OG/Twitter | JSON-LD |
|-------|-------------|-------------|-----------|------------|---------|
| `/` | `File ITR before the deadline · LastMinute ITR` | `SITE_TAGLINE` | ✅ `/` | Root layout (generic) | ✅ `SoftwareApplication` + `Organization` |
| `/learn` | `Learn — ITR guides · LastMinute ITR` | Custom | ❌ | Root defaults (not learn-specific) | ❌ |
| `/learn/[slug]` | Article title · LastMinute ITR | Article description | ❌ | Root defaults | ❌ |
| `/glossary` | `Glossary — tax terms in plain English · …` | Custom | ❌ | Root defaults | ❌ |
| `/glossary/[term]` | Term label · LastMinute ITR | Term explanation (short) | ❌ | Root defaults | ❌ |
| `/reviews` | `Reviews · LastMinute ITR` | Custom | ❌ | Root defaults | ❌ |

**Root layout (`app/layout.tsx`):**
- ✅ `metadataBase`, title template, `keywords`, `robots: index,follow`, `openGraph.locale: en_IN`
- ❌ No `og:image` / `twitter:image` anywhere
- ❌ No `og:url` per page
- ❌ Keywords duplicated on every page (low value, not harmful)

**Homepage JSON-LD (`LandingJsonLd.tsx`):**
- ✅ Valid `SoftwareApplication` + `Organization` types
- ⚠️ **Policy risk:** `aggregateRating.ratingValue: "4.9"`, `reviewCount: "128"` while UI shows **4.8 from 6 verified filers** (`lib/constants.ts`, `lib/content/testimonials.ts`)
- ⚠️ Hardcoded org URL `https://lastminute-itr.vercel.app` (ignores `NEXT_PUBLIC_APP_URL`)

### Crawl infrastructure

| Asset | Location | Status |
|-------|----------|--------|
| Robots | `app/robots.ts` (not `public/robots.txt`) | ✅ Dynamic; references sitemap |
| Sitemap | `app/sitemap.ts` | ✅ **46 URLs** (4 hubs + 4 learn + 38 glossary) |
| Static public SEO files | `public/` | ❌ No robots.txt, no static sitemap (Next route handles both) |

**Sitemap contents:**
- `/` priority 1.0, weekly
- `/learn` 0.8, `/glossary` 0.7, `/reviews` 0.6
- Learn articles: priority 0.7, `lastModified` from `publishedAt`
- Glossary terms: priority 0.5, yearly, `lastModified: new Date()` (always today — noisy signal)

**Robots rules:**
- Allow: `/`, `/learn`, `/glossary`, `/reviews` (+ trailing slash variants)
- Disallow: `/file/`, `/api/`
- ✅ Correct for companion filing app (keep filing funnel noindex)

### Content inventory (`lib/content/**`)

| File | Type | Count | Quality |
|------|------|-------|---------|
| `learn-articles.ts` | Blog/guides | **4** | Real markdown-ish content, not lorem ipsum |
| `glossary.ts` | Programmatic terms | **38** | Engine field labels; 1–2 sentence explanations |
| `testimonials.ts` | Social proof | **6** | Seeded quotes for carousel + reviews page |

**Blog reality vs placeholder:** ✅ **Real starter content**, not placeholders — but volume is far below competitive ITR sites (ClearTax, Tax2Win publish 100s of articles). Read times (5–8 min) are aspirational; actual word count ≈ **400–750 words/article**.

### Glossary search

- ✅ Client-side filter in `GlossarySearch.tsx` (label, explanation, slug)
- ✅ Accessible search input with result count
- ❌ No server-side search / no `/glossary?q=` URL (not indexable as search landing pages)
- ❌ Term pages have no related terms, no links to learn articles, no CTA

### Reviews page

- ✅ Static testimonials rendered from `TESTIMONIALS`
- ✅ Feedback form POSTs to `/api/feedback`
- ❌ No `Review` / `AggregateRating` schema on `/reviews` (only misleading schema on homepage)
- ❌ Client component page (`"use client"`) — metadata via layout only

### Internal link graph (current)

```
Homepage
  ├─ Header: /file, /file/import/documents, /learn, /#pricing, CTA Form 16
  ├─ Body: QuickStart connectors → /file/import/*, ReviewsCarousel → /reviews
  └─ Footer: /learn, /glossary, /#pricing, /reviews, /file/onboarding/signin

/learn index → 4 article cards
/learn/[slug] → back link to /learn only (no cross-links, no CTA, no glossary)
/glossary index → 38 term cards (search)
/glossary/[term] → back link to /glossary only
/reviews → no outbound content links

/file/other → one glossary link (/glossary/section-80ttb) — only in-app content link found
```

**Gaps:**
- Homepage body never links to `/learn` articles or `/glossary`
- Header omits Glossary and Reviews
- Zero learn ↔ glossary cross-links
- No contextual CTAs on articles ("Import Form 16", "Compare regimes")
- No breadcrumb navigation or hub pages by topic cluster

---

## Thin Pages & Indexation Risk

| URL pattern | Est. words | Risk | Action |
|-------------|-----------|------|--------|
| `/glossary/[term]` | 40–120 | **High** — Google may classify as doorway/thin | Expand to 300–600 words OR noindex until enriched |
| `/learn/[slug]` | 400–750 | **Medium** — acceptable seed content | Target 1,200+ words for competitive queries |
| `/reviews` | ~200 + form | **Low–Medium** | Add schema; more UGC over time |
| `/learn` index | ~50 + cards | **Low** | Add cluster intro copy (200+ words) |
| `/glossary` index | ~50 + cards | **Low** | Add taxonomy intro + featured terms |

**Duplicate/thin programmatic risk:** 38 glossary pages share identical layout with only label + 1 sentence different. Without expansion, mass indexing invites **Helpful Content** demotion.

---

## Metadata Issues (prioritized fix list)

1. **Misleading AggregateRating** — JSON-LD claims 128 reviews @ 4.9; site shows 6 @ 4.8. Google rich-result penalty risk.
2. **Missing og:image** — All social shares render without preview image.
3. **Missing canonicals** — Learn, glossary, reviews, articles lack `alternates.canonical`.
4. **OG title/description not page-specific** — Article pages share homepage OG text in `<meta property="og:title">`.
5. **No Article schema** — Learn posts missing `datePublished`, `author`, `headline`.
6. **No DefinedTerm / FAQ schema** — Glossary terms eligible but unused.
7. **Sitemap lastModified noise** — Glossary uses `new Date()` instead of content revision date.
8. **Production URL 404** — Sitemap/robots/canonicals point to dead deployment.

---

## Landing Keyword Plan (homepage + future landers)

### Primary homepage targets (already partially aligned)

| Keyword cluster | Current H1/meta alignment | Search intent | Priority |
|-----------------|---------------------------|---------------|----------|
| last minute ITR filing | ✅ Strong in H1 + keywords | Transactional, deadline urgency | P0 |
| file ITR before deadline | ✅ Page title | Transactional | P0 |
| old vs new tax regime calculator | ✅ Regime card on page | Commercial investigation | P0 |
| Form 16 upload ITR | ✅ QuickStart + CTA | Transactional | P0 |
| AIS mismatch ITR | ✅ Hero copy | Problem-aware | P1 |
| AI CA income tax India | ✅ Brand positioning | Branded + category | P1 |

### Recommended dedicated landing pages (not yet built)

| Slug (proposed) | Primary keyword | Secondary keywords |
|-----------------|-----------------|-------------------|
| `/itr-deadline-2026` | ITR last date 2026 | belated return, penalty, extension |
| `/form-16-filing` | file ITR with Form 16 | Part A Part B, upload Form 16 |
| `/ais-mismatch-check` | AIS mismatch income tax | AIS vs 26AS, fix before filing |
| `/old-vs-new-regime` | old vs new tax regime 2026 | which regime is better, 87A rebate |
| `/itr-1-salaried` | ITR 1 for salaried employees | Sahaj, salary only return |
| `/capital-gains-itr` | capital gains tax filing India | Schedule CG, Zerodha, Groww |
| `/senior-citizen-itr` | ITR for senior citizens | 80TTB, higher exemption |
| `/freelancer-itr-india` | freelancer income tax return | 44ADA, presumptive taxation |
| `/fn-o-tax-filing` | F&O tax filing India | turnover, audit, ITR-3 |
| `/itr-refund-status` | ITR refund status check | refund delayed, rectification |

Each lander should: unique H1, 800+ words, FAQ schema, CTA to `/file/import/documents`, 3+ internal links to `/learn` articles.

---

## Internal Linking Strategy

### Hub-and-spoke model

```
                    [Homepage]
                   /    |     \
            /learn hub  /glossary hub  /reviews
           /  |  \         |  |
    Cluster pages    Term pages (enriched)
    (15 topics)           |
           \              /
            \-- cross-links + CTAs --> /file/import/documents
```

### Rules (implement in content, not code yet)

1. **Every learn article** must include:
   - 2–4 links to related `/learn` posts
   - 2–3 links to `/glossary/{term}` where terms first appear
   - 1 primary CTA block → `/file/import/documents?source=form16` or regime compare
   - Breadcrumb: Home → Learn → Article

2. **Every glossary term (enriched)** must include:
   - "See also" 3 related terms
   - 1 parent learn article link
   - Soft CTA: "Check this on your return → Start free"

3. **Homepage** should add a "Popular guides" section linking top 4 learn articles + top 6 glossary terms.

4. **Header nav** add Glossary; optional Resources dropdown (Learn, Glossary, Reviews).

5. **Footer** add topic cluster links once cluster hub pages exist.

6. **Anchor text discipline:** Use descriptive anchors ("old vs new regime comparison") not "click here".

### Link equity priority (who links to whom)

| From | To (priority order) |
|------|---------------------|
| Homepage | `/file/import/documents`, top learn articles, `/learn/old-vs-new-regime` |
| High-traffic learn posts | Product import, related learn, glossary terms |
| Glossary terms | Parent learn hub, related terms, product |
| Reviews | Homepage, `/learn/last-minute-filing` (social proof → action) |

---

## Programmatic Glossary Strategy

### Current state
- Source: `itr-filing-wireframes/sources/engine/plain_english.py` field map
- Generation: `Object.entries(ENTRIES)` → slug via `slugify(label)`
- Routes: SSG via `generateStaticParams()` — ✅ good for performance
- SEO value today: **Low** (definitions too short)

### Phase 1 — Enrich without new routes (weeks 1–4)
Extend `GlossaryTerm` interface with optional fields:
- `category` (deductions, income heads, schedules, regime, compliance)
- `relatedSlugs: string[]`
- `learnSlug?: string` (parent article)
- `extendedBody?: string` (200–400 words: example, who it affects, common mistakes)
- `faq?: { q: string; a: string }[]`

**Indexation rule:** Keep in sitemap only when `extendedBody.length >= 300`.

### Phase 2 — Taxonomy hubs (weeks 5–8)
Add hub pages (new routes later):
- `/glossary/deductions` (80C, 80D, 80GG, …)
- `/glossary/schedules` (Schedule CG, TDS, BP, …)
- `/glossary/regime` (old vs new terms)

Each hub: 400-word intro + filtered term grid + links to learn cluster.

### Phase 3 — Engine sync (ongoing)
- Auto-regenerate glossary from `plain_english.py` on engine changes
- CI check: every engine field has glossary entry
- Slug stability: never change slugs; use redirects if label changes

### Phase 4 — SERP features
- `DefinedTermSet` on hub pages
- `FAQPage` schema on terms with FAQ arrays
- Avoid indexing raw engine IDs (`B1_ia`) — user-facing slugs only (already done)

---

## 150-Topic SEO Roadmap (by cluster)

### Cluster 1: Last-minute ITR (15)

1. Last-minute ITR filing: 48-hour checklist *(published)*
2. ITR filing deadline AY 2026-27: dates and penalties
3. Can I file ITR after the deadline? Belated return guide
4. Documents checklist for filing ITR in one sitting
5. How to file ITR at night before the deadline
6. ITR filing timeline: from Form 16 to e-verify
7. Last-minute ITR for procrastinators: minimum viable filing
8. What happens if you miss the ITR due date
9. Extension of ITR due date: myths vs reality
10. How long does ITR filing take for salaried employees
11. ITR filing rush week: how to avoid portal errors
12. Pre-deadline tax planning vs post-deadline filing
13. Last-minute ITR with multiple Form 16s
14. ITR filing when employer delayed Form 16
15. Emergency CA review before deadline: when it's worth it

### Cluster 2: Form 16 (15)

16. How to read Form 16 Part A and Part B
17. Form 16 vs salary slip: what's different for ITR
18. Upload Form 16 online: step-by-step
19. Form 16 missing: how to file ITR without it
20. Two Form 16s from job change: how to combine
21. Form 16 TDS doesn't match salary: what to do
22. HRA in Form 16: exemption vs taxable
23. Standard deduction on Form 16 (old vs new regime)
24. Form 16 errors by employer: employee fixes
25. Form 16 and 26AS reconciliation guide
26. Previous employer Form 16 forgotten at new job
27. Form 16 for pensioners and family pension
28. Form 16 Annexure: allowances breakdown
29. Digital Form 16 PDF parsing: what filers should verify
30. Form 16 vs AIS: which to trust first

### Cluster 3: AIS / 26AS mismatch (15)

31. AIS mismatch: why ITD shows income you forgot *(published)*
32. AIS vs 26AS: differences explained
33. How to download AIS from incometax.gov.in
34. AIS Part A TDS: matching with Form 16
35. Bank FD interest in AIS but not in return
36. Broker AIS entries: sold shares not in ITR
37. Previous employer TDS missing in Form 16 (AIS shows it)
38. Tenant TDS on rent in AIS
39. Mutual fund dividends in AIS
40. How to fix AIS mismatch before filing
41. AIS "Information" vs "Processed" status
42. TDS credit not reflecting: 26AS troubleshooting
43. AIS JSON download and review workflow
44. Common AIS lines that trigger notices
45. AIS mismatch and advance tax liability

### Cluster 4: Old vs new regime (15)

46. Old vs new tax regime: which saves more *(published)*
47. New tax regime slab rates AY 2026-27
48. Old tax regime slab rates AY 2026-27
49. Section 87A rebate in new regime (₹12 lakh)
50. Standard deduction ₹75,000 in new regime
51. When old regime beats new regime: worked examples
52. HRA exemption: only in old regime
53. 80C in old regime: full guide
54. How to switch tax regime at filing vs employer
55. Default new regime: how to opt out
56. New regime for high earners (>₹15 lakh)
57. Old vs new regime for renters without HRA
58. Old vs new regime with home loan interest
59. Regime choice for dual-income household
60. Regime comparison spreadsheet vs calculator

### Cluster 5: Senior citizen (10)

61. ITR filing for senior citizens (60+)
62. Super senior citizen slab benefits (80+)
63. Section 80TTB: interest deduction for seniors
64. Senior citizen health insurance 80D limits
65. ITR-1 for pension-only senior citizens
66. Form 16 not applicable: pension AIS filing
67. TDS on FD for senior citizens
68. Senior citizen regime choice: old vs new
69. ITR due date for senior citizens (if extended)
70. E-verify options for seniors without Aadhaar OTP

### Cluster 6: Salaried employees (15)

71. ITR-1 for salaried employees: complete guide
72. ITR-1 vs ITR-2: pick the right form *(published)*
73. Salary components taxable vs exempt
74. LTA exemption rules and proof
75. Professional tax deduction u/s 16(iii)
76. Leave encashment taxation on resignation
77. Gratuity exemption limits
78. ESOP taxation for salaried employees
79. Bonus taxation and TDS
80. Arrear salary relief u/s 89
81. Two employers in one year: ITR workflow
82. Salaried + side freelancing: which ITR form
83. House property loss set-off for salaried
84. Section 80CCD(2): employer NPS in both regimes
85. Rent receipt and HRA claim without Form 16 HRA

### Cluster 7: Freelancers & consultants (15)

86. ITR for freelancers India: which form
87. Section 44ADA presumptive taxation guide
88. 50% presumptive income for professionals
89. GST registration vs ITR for freelancers
90. Foreign client payments: ITR reporting
91. TDS u/s 194J on professional fees
92. Advance tax for freelancers: due dates
93. Books of accounts when presumptive doesn't apply
94. Freelancer old vs new regime strategy
95. Consultant with salary + freelance income
96. Doctor CA lawyer ITR: common deductions
97. Section 44AD for small business vs 44ADA
98. Freelancer AIS mismatches (client TDS)
99. Invoice vs cash: income recognition for ITR
100. Freelancer e-verify and refund timeline

### Cluster 8: Capital gains (15)

101. Schedule CG explained for equity investors
102. STCG vs LTCG on shares AY 2026-27
103. Mutual fund capital gains taxation
104. Grandfathering for LTCG on equity (pre-2018)
105. Capital gains from property sale: ITR-2
106. Indexation benefit on debt mutual funds
107. Loss harvesting before March 31
108. Zerodha/Groww tax P&L import guide
109. STT paid and ITR reporting
110. Capital gains set-off rules across years
111. Foreign equity capital gains in ITR
112. Gifted shares: cost of acquisition
113. IPO listing gains taxation
114. Crypto taxation and ITR reporting (VDA)
115. Property + equity: why you need ITR-2

### Cluster 9: F&O / trading (15)

116. F&O turnover calculation for ITR
117. ITR-3 for F&O traders: when required
118. Tax audit u/s 44AB for F&O
119. ITR-4 presumptive for traders: eligibility
120. Broker ledger vs tax P&L reconciliation
121. Expenses allowed against F&O income
122. Loss carry forward for F&O business loss
123. Intraday vs delivery: tax treatment
124. MTF and margin interest deductions
125. Multiple brokers: consolidating trades
126. AIS broker entries for F&O
127. Advance tax for active traders
128. F&O + salary: dual income filing
129. Turnover threshold myths (1 crore rule)
130. ITR filing mistakes F&O traders make

### Cluster 10: Common mistakes (10)

131. Wrong ITR form selected: consequences
132. Not reporting bank interest income
133. Missing previous employer income
134. Wrong regime selected at filing
135. TDS claimed but not in 26AS
136. Not paying advance tax before filing
137. Skipping AIS review before submit
138. House property in wrong category
139. Capital gains reported in wrong schedule
140. Not e-verifying within 30 days

### Cluster 11: E-verify (10)

141. How to e-verify ITR: all methods
142. Aadhaar OTP e-verify step-by-step
143. Net banking e-verify eligible banks
144. DSC e-verify for professionals
145. EVC through bank ATM (legacy method)
146. ITR sent to CPC but not e-verified
147. E-verify deadline and penalties
148. E-verify failed: troubleshooting
149. Belated return e-verify rules
150. E-verify after revised return

### Cluster 12: Refund status (10) — *bonus overlap with filing lifecycle*

*(Included in 150 above as topics 141–150 in e-verify; refund cluster as sub-hub linking from articles)*

**Refund-focused articles (prioritize in backlog after first 25):**
- ITR refund status: how to check on portal
- Refund delayed beyond 30 days: reasons
- Refund adjusted against outstanding demand
- Rectification vs revised return for refund
- Bank account validation for refund
- Interest u/s 244A on delayed refund
- Refund reissue request workflow
- Negative tax payable vs refund confusion
- Refund when AIS added extra income
- Refund timeline AY 2026-27

*(Note: Total unique topics = 150 core + 10 refund = 160 in backlog; refund items replace lowest-priority F&O topics if strict 150 cap required.)*

### Cluster 13: ITR forms explained (15)

- ITR-1 Sahaj eligibility checklist
- ITR-2 for capital gains and multiple properties
- ITR-3 for business and F&O
- ITR-4 Sugam presumptive taxation
- ITR-5/6/7: when individuals don't use them
- ITR form selection flowchart
- Defective return notice from wrong form
- Schedules in ITR-2 explained
- Schedule OS: other sources income
- Schedule HP: house property
- Schedule VI-A deductions mapping
- Schedule TDS and Form 26AS
- Schedule IT: advance tax challan
- ITR JSON upload vs online form
- Revised return vs updated return

*(Forms cluster topics integrated across clusters 6–9; numbered items 71–72, 86, 101, 116–117 cover core form selection.)*

---

## First 25 Priority Posts (ship order)

Ranked by **commercial intent × product fit × deadline seasonality** for AY 2026-27.

| # | Slug (proposed) | Title | Cluster | Product CTA |
|---|-----------------|-------|---------|-------------|
| 1 | `last-minute-filing` | Last-minute ITR filing: 48-hour checklist | Last minute | ✅ Published |
| 2 | `old-vs-new-regime` | Old vs new tax regime: which saves more | Regime | ✅ Published |
| 3 | `ais-mismatch` | AIS mismatch guide | AIS | ✅ Published |
| 4 | `itr-1-vs-itr-2` | ITR-1 vs ITR-2 | Forms | ✅ Published |
| 5 | `itr-deadline-2026` | ITR last date AY 2026-27 | Last minute | Start filing |
| 6 | `form-16-guide` | How to read Form 16 Part A & B | Form 16 | Upload Form 16 |
| 7 | `form-16-upload-itr` | File ITR by uploading Form 16 | Form 16 | Upload Form 16 |
| 8 | `ais-vs-26as` | AIS vs 26AS differences | AIS | Import AIS |
| 9 | `download-ais` | How to download AIS from IT portal | AIS | Import AIS |
| 10 | `new-regime-slabs-2026` | New tax regime slabs AY 2026-27 | Regime | Regime compare |
| 11 | `87a-rebate-new-regime` | Section 87A rebate up to ₹12 lakh | Regime | Regime compare |
| 12 | `itr-1-salaried-guide` | ITR-1 for salaried employees | Salaried | Start ITR-1 |
| 13 | `two-form-16-job-change` | Two Form 16s after job change | Form 16 | Import docs |
| 14 | `bank-fd-interest-ais` | FD interest in AIS: how to report | AIS | Mismatch check |
| 15 | `e-verify-itr-guide` | How to e-verify ITR (all methods) | E-verify | Post-file guide |
| 16 | `itr-refund-status` | Check ITR refund status | Refund | Tracker |
| 17 | `schedule-cg-explained` | Schedule CG for equity investors | CG | Groww import |
| 18 | `zerodha-tax-pnl-itr` | Zerodha tax P&L for ITR | CG | Groww import |
| 19 | `80c-deduction-guide` | Section 80C deductions guide | Regime/old | Deduction scan |
| 20 | `hra-exemption-itr` | HRA exemption in ITR | Salaried | Form 16 import |
| 21 | `freelancer-44ada` | 44ADA for freelancers | Freelancer | ITR path |
| 22 | `senior-citizen-80ttb` | 80TTB for senior citizens | Senior | Glossary link |
| 23 | `common-itr-mistakes` | 10 ITR mistakes that cause notices | Mistakes | Pre-submit check |
| 24 | `fn-o-turnover-itr3` | F&O turnover and ITR-3 | F&O | Case matrix |
| 25 | `belated-return-penalty` | Belated ITR penalty and interest | Last minute | File now |

**Production notes for each new post:**
- Target **1,200–1,800 words**, 3+ internal links, 1 FAQ block, unique meta description, canonical, Article JSON-LD, CTA component.

---

## Backlog (posts 26–150)

All remaining topics from the cluster list above, prioritized in this order:

1. **Weeks 3–6:** Form 16 cluster (16–30), remaining AIS (32–45)
2. **Weeks 7–10:** Regime deep dives (47–60), salaried (73–85)
3. **Weeks 11–14:** Capital gains + broker imports (101–115)
4. **Weeks 15–18:** Freelancer + 44ADA (87–100)
5. **Weeks 19–22:** F&O trader series (117–130)
6. **Weeks 23–26:** Senior citizen (61–70), mistakes (131–140), e-verify/refund (141–150)
7. **Ongoing:** Glossary enrichment parallel track (5 terms/week expanded)

---

## Browser Verification Summary

| URL | Result |
|-----|--------|
| `https://lastminute-itr.vercel.app/` | ❌ 404 DEPLOYMENT_NOT_FOUND |
| `http://localhost:3000/` | ✅ Renders; title "File ITR before the deadline"; H1 present; nav + footer links work |
| `http://localhost:3000/learn` | ✅ 4 articles listed; title "Learn — ITR guides · LastMinute ITR" |
| `http://localhost:3000/sitemap.xml` | ✅ 46 URLs |
| `http://localhost:3000/robots.txt` | ✅ Correct allow/disallow |
| `http://localhost:3000/learn/[slug]` | ⚠️ Dev server 500 (lucide vendor chunk) — likely dev-only; verify in production build |
| `http://localhost:3000/glossary/[term]` | ⚠️ Same dev 500 — verify via `next build && next start` |

---

## Quick Wins (no code in this audit — for next sprint)

1. Deploy to Vercel; set `NEXT_PUBLIC_APP_URL` to production domain.
2. Fix JSON-LD ratings to match real testimonial count or remove until UGC scales.
3. Add `og:image` (1200×630) in root layout.
4. Add canonical + page-specific OG to learn/glossary article metadata.
5. Add Article + BreadcrumbList JSON-LD to learn pages.
6. Expand top 10 glossary terms to 400+ words before July filing season.
7. Homepage "Popular guides" section linking 4 existing articles.
8. Article footer CTA: "Import Form 16 — free estimate".
9. Noindex glossary terms until `extendedBody` exists (optional `robots` in metadata).
10. Submit sitemap in Google Search Console post-deploy.

---

## Competitive Positioning Note

ClearTax, Tax2Win, and H&R Block India dominate head terms with **1,000+ indexed URLs** each. LastMinute ITR's differentiation for SEO:

- **Import-first + mismatch + regime compare** (unique product hooks in content CTAs)
- **Companion filing** angle (gov portal cheat sheet — few competitors message this)
- **Deadline urgency** brand (`LastMinute`) aligned with seasonal query spikes (July 31)

Win on **long-tail problem queries** (AIS mismatch, two Form 16s, regime calculator) before attacking head terms ("ITR filing online").

---

*End of SEO Growth Plan — Agent 4 audit complete.*
