# Phase 1 — Research (No Coding)

**Status:** Complete (this package)  
**Exit gate:** Founders accept V1 persona lock + evidence-first strategy

---

## 1. Indian Tax Filing Ecosystem Map

### 1.1 Individual filing paths

| Path | Who | Tools today | Pain |
| --- | --- | --- | --- |
| DIY portal | Simple salaried | ITD JSON/offline utilities | UX, fear, mismatches |
| Assisted DIY | Salaried + light CG | ClearTax, Tax2win, apps | Trust, upsells, accuracy |
| CA-assisted | Complex / busy / afraid | Computax, Winman, Excel | Cost, delay, WhatsApp chaos |
| Employer-aided | Corporates | HR portals, limited | Only Form16, not full ITR |

### 1.2 Government / infrastructure stack

| System | Role | Product implication |
| --- | --- | --- |
| incometax.gov.in | File + e-verify | Companion must track UI changes |
| AIS / TIS | Third-party info | Reconcile spine |
| Form 26AS | TDS/TCS ledger | Refund accuracy |
| TRACES | TDS statements | Employer/deductor issues |
| PAN / Aadhaar | Identity | Verification, not storage of Aadhaar if avoidable |
| MCA | Directors/companies | Escalation trigger |
| GST | Business turnover signals | Cross-check later phases |

### 1.3 Income heads & schedules (coverage map)

| Area | V1 | V2 | V3+ |
| --- | --- | --- | --- |
| Salary | Yes | Yes | Yes |
| Other interest | Yes | Yes | Yes |
| HP simple | Limited | Yes | Yes |
| CG equity/MF 112A | No | Yes | Yes |
| F&O | No | Flag only | Yes |
| Business / presumptive | No | No | Yes |
| ESOP/RSU | No | Partial | Yes |
| Foreign / FA | No | No | Careful |
| Crypto | No | No | Careful |
| HUF | No | No | Yes |
| NRI | No | No | Specialist |
| Director | No | No | Specialist |
| Schedule AL | No | Threshold detect | Yes |

---

## 2. CA Interview Simulation — Full Detail

### 2.1 Small CA firms (1–5 staff) — Tier 2/3 + metros

**Profile:** 50–400 returns/season; Computax or Winman single license; Excel everywhere.

| Dimension | Findings |
| --- | --- |
| Biggest pain points | Incomplete client docs; last-week rush; portal downtime |
| Slowest workflows | AIS download + reconcile; CG from broker PDFs |
| Manual work | Re-typing Form16; copy-paste interest certificates |
| Excel dependency | Client master, CG sheets, advance tax trackers |
| Common client mistakes | Wrong regime; missed FD interest; rent without evidence |
| Common notices | AIS mismatch; TDS credit mismatch; defective return |
| Common corrections | Revised returns; updated AIS acceptance |
| Common calculations | Regime compare; HP interest; 80C stacking |
| Time wasted | Chasing WhatsApp photos of Form16 |
| Missing software | Client collection app with validation |
| Wish list | Auto-reconcile + exception list |
| Dream features | “Green clients auto-ready; I only touch red” |

**Implication for LastMinuteITR:** B2C product that produces CA-ready evidence packs is a lead-gen and co-pilot wedge.

### 2.2 Medium firms (5–25 staff)

| Dimension | Findings |
| --- | --- |
| Pain | Training juniors; review bottlenecks |
| Slowest | Partner review of complex CG/F&O |
| Manual | Checklist compliance varies by staff |
| Notices | Inconsistent risk culture |
| Wish list | Firm policy engine (“never claim X without Y”) |
| Dream | Real-time dashboard: not started / in review / filed |

### 2.3 Large firms / networks

| Dimension | Findings |
| --- | --- |
| Pain | Multi-office standards; auditability |
| Slowest | Cross-office handoffs |
| Wish list | SSO, immutable logs, API to DMS |
| Dream | Enterprise control tower |

### 2.4 Geographic notes (directional)

| Region | Pattern |
| --- | --- |
| Mumbai / Ahmedabad | Heavy capital markets, F&O, business |
| Bengaluru / Hyderabad | Salaried + ESOPs/RSUs |
| Delhi NCR | Mix + NRI relatives |
| Pune / Indore / Nagpur | Classic salaried + HP + small business |
| Tier 2/3 | Price sensitive; Hindi; CA loyalty high |

---

## 3. Taxpayer Interview Simulation — Full Detail

### 3.1 Cross-cutting insights (n≈1000 synthetic)

1. **Portal fear > tax math fear** — people fear clicking wrong on ITD  
2. **Refund obsession** — marketing that guarantees refunds destroys trust when wrong  
3. **AIS is invisible until notice** — education opportunity  
4. **They hire CAs for accountability**, not only skill  
5. **Delay is emotional** (avoidance), not only complexity  
6. **Data privacy anxiety** rising (PAN, Form16 passwords = PAN)  

### 3.2 Segment cards

**Salaried engineers/PMs:** Want speed, mobile, clear regime pick. Switch if Form16 → done in one sitting.

**Doctors/consultants:** Mixed income; need presumptive vs books guidance later.

**Influencers/freelancers:** Advance tax blindness; quarterly product later.

**Crypto/F&O:** High fear; V1 must refuse with dignity.

**Senior citizens:** 80TTB, large fonts, family co-pilot mode.

**NRIs:** Residency tests; do not fake support.

### 3.3 Jobs-to-be-done

- “Help me not get a notice.”  
- “Tell me old vs new in my numbers.”  
- “Walk me through the portal like a person sitting next to me.”  
- “Don’t make me feel stupid.”

---

## 4. Competitor reverse-engineering (research notes)

### ClearTax
- Strength: Brand, SEO, salaried UX, mobile  
- Weakness: Upsell fatigue; complex cases still shallow vs CA software  
- Lesson: Content machine + simple path

### Computax / Winman
- Strength: Depth, CA trust, schedules, bulk  
- Weakness: UX, desktop, collaboration, AI  
- Lesson: Depth + audit trail; we add cloud + AI co-pilot

### TaxCloud / EZTax / Gen IT
- Strength: Regional CA adoption pockets  
- Weakness: Consumer brand weak  
- Lesson: CA relationships matter

### ITD Portal
- Strength: Authority, free, final truth  
- Weakness: UX, guidance, prep  
- Lesson: Never compete as filer of record; be the best prep layer

---

## 5. Research conclusions (locked proposals)

| Decision | Proposal | Rationale |
| --- | --- | --- |
| V1 persona | Resident salaried simple | Accuracy + speed |
| Paid core | Portal companion + notice-safe draft | Clear value |
| Moat | Evidence graph + reconcile | Hard to copy |
| CA motion | Co-pilot not replacement | Trust + sales |
| AI style | Tools+rules, not chatty oracle | Non-hallucination |

---

## Phase 1 exit checklist

- [ ] Founders accept V1 persona lock  
- [ ] Founders accept companion-not-efile positioning  
- [ ] Founders accept CA co-pilot as Year-2 wedge  
- [ ] Proceed to Phase 2 Architecture only after sign-off  
