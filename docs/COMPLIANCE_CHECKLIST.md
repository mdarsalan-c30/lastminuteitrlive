# Compliance checklist — pre-deploy QA

One-page gate before marketing or funnel copy ships. Full context: [MARKETING_CONTENT_GROWTH_PLAN.md](./MARKETING_CONTENT_GROWTH_PLAN.md) · [PHASE_6_COPY_TRUST.md](./PHASE_6_COPY_TRUST.md).

## Prohibited claims (grep before deploy)

Search `app/`, `components/marketing/`, `lib/copy/`, `lib/content/`, `components/filing/` for:

- `guaranteed refund` (unless negated: "no guaranteed refund")
- `loophole` (unless negated: "no loopholes")
- `file for you` / `we file` / `on your behalf` (unless negated)
- `government partner` / `official ITD` / `government integrated`
- `auto-submit` / `auto-file` (unless negated)
- `100% accurate`

**Allowed:** Negations in legal pages, FAQ, footer, and trust copy.

## Required disclosures (spot-check)

- [ ] Hero or nearby: user files on incometax.gov.in
- [ ] Paywall / checkout: payment unlocks guide, not filing service
- [ ] Refund language: estimates only, ITD decides final amount
- [ ] CA Review: coming soon if mentioned
- [ ] Quiz / tools: rule-based, not "AI analyzing"

## Phase 6 interactive hooks

- [ ] Form 16 card routes to real paths (`/file/import/documents`, `/file/income`)
- [ ] ITR quiz uses `suggestItrType()` — no LLM
- [ ] Readiness checklist is client-only (no false save claims)
- [ ] `LastMinuteBanner` uses `ITR_FILING_DEADLINE` constant

## Commands

```bash
npm run lint
npm run test
npm run build
npm run predeploy
npx vercel deploy --prod --yes
```

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| Engineering | | lint / test / build green |
| Copy | | grep clean |
| Deploy | | Vercel prod URL recorded |
