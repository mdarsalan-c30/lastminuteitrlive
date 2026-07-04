# Phase 6 — SEO & Marketing (Blueprint + Foundations)

**Status:** ✅ **EXECUTED (Jul 2026)** — see specs [60](./60_SEO_CLUSTER_CALENDAR.md)–[63](./63_CA_PARTNER_PROGRAM.md). Code mirrors in `frontend/lib/seo/`.  
**Depends on:** Phase 1 positioning lock (ran parallel to 2–5)

---

## 1. SEO strategy

### 1.1 Goals

- Own **intent clusters** around Form16, AIS mismatch, regime choice, ITR-1 eligibility, notices  
- Build topical authority before paid scale  
- Programmatic pages for glossary + persona guides  

### 1.2 Keyword themes (high traffic / mixed competition)

| Theme | Example intents | Competition |
| --- | --- | --- |
| ITR filing | file ITR online, ITR last date | High |
| Form16 | how to read Form16, Form16 password | Med |
| AIS | AIS vs 26AS, AIS mismatch | Med-low |
| Regime | old vs new tax regime calculator | High |
| Refund | income tax refund status meaning | Med |
| Notices | income tax notice 143(1) | Med |
| CG | equity LTCG 112A | Med |
| Deductions | 80C limit, 80D senior | Med |

### 1.3 Internal linking

```
Pillar: /learn/itr-filing-guide
  ├─ Form16 cluster
  ├─ AIS/26AS cluster
  ├─ Regime cluster
  ├─ Notice cluster
  └─ Persona cluster → /file CTA
Glossary terms ↔ Learn articles (bidirectional)
Tools ↔ Learn (calculator → explainer)
```

### 1.4 Programmatic SEO

- `/glossary/[term]` — expand to 200+ terms  
- `/learn/[persona]-itr-guide`  
- `/learn/ais-shows-[type]-what-to-do`  
- Comparison pages only if legally careful (no defamation)

---

## 2. Blog / content ideas — 500+ via clusters

Each line is a **title template**. Counts sum to **520**. Full cluster lists retained below for the long-term backlog; **90-day ship order is doc 60**.

### Cluster A — Form16 (60)

1–10: How to read Form16 Part A/B (basics, fields, TDS, employer, TAN, address, period, revisions, duplicates, errors)  
11–20: Form16 password (PAN, failures, multiple employers, digital signature, PDF tools, mobile, WhatsApp safety, HR issues, lost Form16, request letter)  
21–30: Multiple Form16 (job change, merge, same FY, three employers, intern+FTE, contractor, arrears, relief u/s 89, notice risk, portal entry)  
31–40: Form16 vs payslip vs AIS vs 26AS (4 comparison articles × variants)  
41–50: Common Form16 mistakes (wrong PAN, wrong TDS, exemptions, HRA, standard deduction, PT, perquisites, stocks, leave encashment, gratuity)  
51–60: Form16 for seniors / new joiners / exit employees / startups / MNCs / remote / ESOP mention / bonus / commission / tips

### Cluster B — AIS / TIS / 26AS (70)

61–80: What is AIS / TIS / 26AS / how to download / password / not reflecting / delayed / revised / feedback / acceptance  
81–100: AIS mismatch salary / interest / dividend / property / TDS / TCS / SFTs / high value / crypto mention / foreign  
101–120: 26AS credit missing / wrong TAN / employer not deposited / refund impact / advance tax / self-assessment / demand / challan  
121–130: AIS vs books for freelancers / doctors / influencers / rent / FD ladder  

### Cluster C — Regime (50)

131–150: Old vs new calculator explainers (salary bands, metro HRA, home loan, 80C max, senior, no deductions, job change, side income, HP, bonus year)  
151–170: Form 10IEA / switch rules / employer declaration vs ITR / mistakes / deadlines / myths  
171–180: Regime for seniors / freelancers / HP / CG (later) / F&O (later)

### Cluster D — ITR forms & eligibility (50)

181–200: ITR-1 vs 2 vs 3 vs 4 (matrix, mistakes, who cannot file ITR-1, clubbing, director, partner, HUF, NRI, trust)  
201–220: Which ITR for salaried / job change / one house / two houses / MF / shares / F&O / business / presumptive / professional  
221–230: Defective return / wrong ITR filed / revise / updated return  

### Cluster E — Deductions (60)

231–250: 80C instruments (PF, PPF, ELSS, life insurance, principal, tuition, NSC, SCSS, etc.)  
251–270: 80D / 80DD / 80DDB / preventive checkup / senior parents / floater  
271–290: HRA / 80GG / rent receipt / landlord PAN / metro / shared rent / WFH myths  

### Cluster F — Notices & compliance (50)

291–310: 143(1) / AIS mismatch notice / outstanding demand / refund failure / e-verify pending / defective / 139(9) / intimations  
311–330: How to respond / when to see CA / timelines / common triggers / prevention checklist  
331–340: Late fee 234F / interest 234A/B/C explainers  

### Cluster G — Capital gains & investors (50) — publish carefully; V2 product

341–370: 112A / equity LTCG / STCG / MF / grandfathers / CAS / broker P&L / Groww / Zerodha / taxes on SIP  
371–390: F&O turnover / audit / business income vs CG myths  

### Cluster H — Personas (40)

391–400: Engineers / doctors / teachers / government employees / startup ESOPs / influencers / truck owners / shopkeepers / seniors / homemakers (clubbing care)  
401–430: NRI relatives guide (referral, not DIY claim) / HUF intro / first-time filers / students internships  

### Cluster I — Portal how-tos (40)

431–470: Step-by-step portal screens (login, prefill, schedules, validate, submit, e-verify Aadhaar OTP, net banking, demat, issues)

### Cluster J — Seasonal / deadlines (20)

471–490: Deadline guides, extensions, belated, updated returns, advance tax calendar quarters

### Cluster K — Trust & product education (30)

491–520: Why companion not auto-file / how we use documents / DPDP / estimates vs final / how to choose a tax app / CA vs DIY  

**Editorial rule:** Money pages reviewed by CA; no refund guarantees; AY labeled.

---

## 3. Marketing strategy

### 3.1 Brand narrative

“Your calm, evidence-linked tax companion for filing on the government portal — built for ordinary Indians, honest about what we don’t support.”

### 3.2 Channel plan

| Channel | Content | KPI |
| --- | --- | --- |
| YouTube | Form16 walkthroughs | Watch time → /file |
| Shorts/Reels | Myths, 30s tips | Profile visits |
| LinkedIn | CA co-pilot thesis | CA waitlist |
| X | Deadline utility | Share of voice season |
| Referral | Give/get companion credit | K-factor |
| CA partners | Co-branded client links | Seats |
| HR | Employee filing week | B2B pilots |
| Campus | Tax literacy | Brand |

### 3.3 Referral engine (design)

- Trigger: successful companion unlock or e-verify self-report  
- Reward: fee credit next AY or unlock feature  
- Fraud: device/payment checks  

**Locked V1 economics:** doc 62 — 10% referee discount, 100 referrer coins, max 25 coins/filing.

### 3.4 CA partner program

- Tiered: Lead share → Co-pilot seats → Firm plans  
- Requirements: valid membership proof  
- Economics: transparent, no spam leads  

**One-pager:** doc 63.

### 3.5 Paid

- Only after funnel conversion > threshold  
- Brand search + high-intent AIS/Form16  
- Avoid broad “ITR filing” until retention proven  

---

## 4. Measurement

| Funnel | Metric |
| --- | --- |
| SEO | Non-brand organic sessions, rankings for cluster heads |
| Product | Upload → reconcile → pay → companion |
| Trust | Support tickets per 100 filers; complaint themes |
| CA | Waitlist → pilot → paid seats |

---

## Phase 6 exit checklist

- [x] Cluster calendar for 90 days approved — [60_SEO_CLUSTER_CALENDAR.md](./60_SEO_CLUSTER_CALENDAR.md)
- [x] Brand voice + disclaimer rules approved — [61_MARKETING_VOICE_DISCLAIMERS.md](./61_MARKETING_VOICE_DISCLAIMERS.md)
- [x] Referral economics approved — [62_REFERRAL_ECONOMICS.md](./62_REFERRAL_ECONOMICS.md)
- [x] CA partner one-pager approved — [63_CA_PARTNER_PROGRAM.md](./63_CA_PARTNER_PROGRAM.md)

## Foundations landed with Phase 6

| Change | Where |
| --- | --- |
| 90-day calendar with live-vs-planned resolution | `frontend/lib/seo/contentCalendar.ts` |
| Marketing banned phrases + disclaimers | `frontend/lib/seo/marketingDisclaimers.ts` |
| Referral economics constants (admin defaults aligned) | `frontend/lib/seo/referralEconomics.ts` |
| Robots: index marketing, block file/auth/admin/api | `frontend/app/robots.ts` |
| Brand metadata (companion, not auto-file) | `frontend/app/layout.tsx` |
| Sitemap: drop non-indexable `/chat` `/profile` | `frontend/app/sitemap.ts` |
