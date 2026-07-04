# Phase 4 — UI/UX (Blueprint Only)

**Status:** ✅ EXECUTED (Jul 2026) — see specs [40](./40_SCREEN_FLOW_SPEC.md) · [41](./41_DESIGN_SYSTEM_SPEC.md) · [42](./42_CONTENT_VOICE_GUIDE.md) · [43](./43_USABILITY_TEST_PLAN.md). Figma prototypes + 8-user study (doc 43) are the remaining exit evidence.  
**Depends on:** Phase 2–3 sign-off

---

## 1. Design principles (IDEO + Stripe + Indian context)

1. **Homely, not corporate-bank cold** — calm teal, clear language  
2. **One job per screen**  
3. **Show math, not mystery** — regime and refund always sourced  
4. **Mismatch-first** — start from conflicts, not blank forms  
5. **Respect fear** — notices explained in plain Hindi/English  
6. **Thumb-first mobile** — tax is filed on phones in Tier 2/3  

---

## 2. Information architecture

### Marketing
`/` · `/tools` · `/learn` · `/glossary` · `/reviews` · legal · `/for-ca` (separate entry)

### Filing (state machine aligned)
`/file` → gate → upload → reconcile → confirm → compute → risk → pay → companion

### CA (later)
`/ca` workspace — not mixed into consumer nav

---

## 3. Key screens (V1)

| Screen | Purpose | Success metric |
| --- | --- | --- |
| Gate | Persona lock | <60s; low drop |
| Upload | Form16 + AIS + 26AS | Time to first extraction |
| Reconcile | Resolve deltas | Material issues = 0 |
| Confirm | Low-confidence fields | Confirm rate |
| Regime | Aha moment | Understanding (survey) |
| Risk | Fear reduction | Acknowledgement |
| Paywall | Unlock companion | Conversion |
| Companion | Portal success | E-verify completion (self-reported) |

---

## 4. UX anti-patterns to delete

- 150-question static wizards  
- “Live” badges on dead connectors  
- Chatbot as homepage hero  
- Duplicate CTAs with different prices  
- Illustrative reviews styled as real  
- Parsing progress theater without outcomes  
- Floating widgets covering primary actions  

---

## 5. Content & language

| Rule | Example |
| --- | --- |
| Plain language | “Tax already paid from salary” not “TDS u/s 192” first |
| Progressive disclosure | Show section code in “Why?” expander |
| Bilingual path | Hindi toggle for V2+ |
| No guarantees | “Estimate” always visible |

---

## 6. Accessibility

- WCAG 2.2 AA target  
- 44px targets  
- Focus order = reading order  
- Errors linked to fields  
- Contrast on mint/teal  

---

## 7. Design system tokens (to specify in design tool)

- Color: primary teal, success, warning, danger, surface  
- Type: display, title, body, caption  
- Space: 4/8 scale  
- Radius, elevation, motion (prefer reduced motion)

---

## 8. Prototype plan (pre-code)

1. Figma flows for Gate → Companion (happy path)  
2. Mismatch conflict card variants  
3. Paywall with companion preview  
4. Mobile usability test with 8 salaried users  
5. Iterate copy only after tests  

---

## Phase 4 exit checklist

- [ ] Figma V1 flows approved  
- [ ] Usability test notes (8 users)  
- [ ] Anti-pattern kill list agreed  
- [ ] Proceed to Smart AI CA phase  
