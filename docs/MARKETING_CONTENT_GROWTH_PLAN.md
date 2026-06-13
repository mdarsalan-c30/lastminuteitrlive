# Marketing content growth plan

Companion-first ITR prep for Indian salaried filers filing on **incometax.gov.in**. LastMinute ITR prepares numbers, flags mismatches, and unlocks a portal walkthrough — the user always submits and e-verifies on the government portal.

**Positioning:** Deadline-season stress relief for simple-to-moderate returns; honest escalation to CA Review (coming soon) for complex cases. Not a government partner, not a refund guarantee, not auto-submit.

See also: [Phase 6 copy & trust baseline](./PHASE_6_COPY_TRUST.md) (shared trust module and funnel copy rules — do not duplicate here).

---

## Trust & compliance checklist (Phase 7)

| # | Check | Status |
|---|--------|--------|
| 1 | User files on incometax.gov.in — never "we file for you" | ✅ Verified in marketing + funnel |
| 2 | No guaranteed refund or 100% accuracy claims | ✅ Verified |
| 3 | No government partner / ITD integration claims | ✅ Verified (negations in FAQ/footer) |
| 4 | Auto-submit only in negated form ("we never auto-submit") | ✅ Verified |
| 5 | No loophole / aggressive tax hack promotion | ✅ Verified (anti-pattern in proof section) |
| 6 | Refund figures framed as estimates | ✅ Verified in hooks + FAQ |
| 7 | CA Review marked coming soon, not active sign-off | ✅ Verified (`lib/copy/trust.ts`) |
| 8 | ITR type quiz labeled rule-based, not AI analysis | ✅ Phase 6 `ItrTypeQuiz` |
| 9 | Interactive hooks are deterministic (no fake AI) | ✅ Form 16 fork, checklist, quiz, banner |
| 10 | Learn links point to real `/learn/*` slugs | ✅ Phase 6 content audit |

---

## Phase 6 hooks inventory

Content source: `lib/content/hooks.ts`  
Composite sections: `components/marketing/EngagementHooksSections.tsx`

### Static blocks

| Hook | Component / section | Notes |
|------|---------------------|-------|
| ITR mistakes checklist | `ItrMistakesSection` | Links to learn articles |
| Do you need a CA? | `NeedCaSection` | Simple vs complex + CA Review soon |
| AI CA checks | `AiCaChecksSection` (existing) | Not duplicated — kept as canonical block |
| Job change | `ScenarioHooksSection` | → `/learn/two-form-16-job-change` |
| Parents' return | `ScenarioHooksSection` | → `/learn/senior-citizen-80ttb` |
| Refund anxiety | `ScenarioHooksSection` | No guaranteed refund |
| AIS vs Form 16 | `ScenarioHooksSection` | → `/learn/ais-mismatch` |
| Last-minute checklist | `ScenarioHooksSection` | CTA → `/file` |
| After payment | `PostPaymentExplainer` | Unlock guide; user files on portal |
| On incometax.gov.in | `PortalFilingExplainer` | Step overview |

### Interactive hooks

| Hook | Component | Behavior |
|------|-----------|----------|
| Do you have Form 16? | `Form16QuickCard` | Yes → import; No → manual income |
| Mini regime check | `RegimeCompareCard` + `#regime-compare` | Anchor from Form16 card |
| ITR readiness checklist | `ItrReadinessChecklist` | Client checkboxes, no persistence |
| Find my ITR type | `ItrTypeQuiz` | 5 questions, `suggestItrType()` rules |
| Urgency banner | `LastMinuteBanner` | Date-aware from `ITR_FILING_DEADLINE` |

### Landing placement (`app/page.tsx`)

After `AiCaChecksSection`, before `QuickStart`:

1. `FilingPrepHooksSection` — banner, Form 16, readiness, mistakes, need CA, quiz  
2. `ScenarioHooksSection` — persona cards + checklist  
3. `FilingJourneySection` — post-payment + portal (after `IndianUseCases`)

---

## Sign-off (Phase 6–7)

| Item | Verified |
|------|----------|
| Phase 6 hooks wired on landing | ✅ |
| No fake AI in quiz or hooks | ✅ |
| Compliance grep on `app/`, `components/marketing/`, `lib/copy/`, `lib/content/`, `components/filing/` | ✅ No violations requiring copy fixes |
| `npm run lint` | Run at deploy |
| `npm run test` | Run at deploy |
| `npm run build` | Run at deploy |
| Production deploy | Run `npm run predeploy` then `npx vercel deploy --prod --yes` |

**Compliance fixes in this pass:** None required — existing copy uses compliant negations; new hooks follow `lib/copy/trust.ts` and `docs/PHASE_6_COPY_TRUST.md` principles.

**Deferred:** Full market sizing research; additional SEO articles beyond Phases 1–5 scope.
