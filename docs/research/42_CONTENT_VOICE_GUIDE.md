# 42 — Content & Voice Guide (Phase 4, Executed)

> Words are the product's UI for a fearful audience. Doc 12's five truths make this concrete: fear beats price, nobody understands regimes, refunds are the product, trust is transferred. Copy is reviewed like code — this guide is the review standard.

## 1. Voice: the neighbourhood CA who happens to be software

- **Warm, never cute.** "Let's check your Form 16" — not "Yay! Time for taxes! 🎉".
- **Certain about facts, humble about outcomes.** State the rule plainly; label projections as estimates.
- **Speaks first in money and consequences, section numbers second.** The section code always exists — inside the "Why?" expander — because S7 users and CAs need it for notices.
- **Never scolds.** A missed deadline gets consequences explained, not blame ("Filing after 31 July adds a ₹1,000–5,000 fee. Here's your exact number.").
- **Never guarantees.** Banned words: *guaranteed, maximum refund guaranteed, 100% accurate, fully automatic, instant refund, approved by ITD*.

## 2. Plain-language dictionary (first mention → jargon in the "Why?" layer)

| Say first | The jargon (kept in expander) |
|---|---|
| Tax already paid from your salary | TDS u/s 192 |
| Statement of everything the tax dept knows about your income | AIS (Annual Information Statement) |
| Your tax-payment passbook | Form 26AS |
| Money the govt owes you back | Refund |
| Discount that makes your tax zero | Rebate u/s 87A |
| The two tax rulebooks — you pick the cheaper one | Old vs new regime |
| Extra fee for filing late | Late fee u/s 234F |
| Profit from selling shares/MF | Capital gains (111A/112A) |
| The tax dept asking a question about your return | Notice (143(1)/139(9)) |
| Confirming it's really you (2 minutes, OTP) | E-verification |
| Health-check of your return before you file | Validations / risk checks |

Rule: a screen may introduce **at most one new concept**; the current app demands nine at once (UX review failure #2).

## 3. Microcopy per state (canonical strings, EN v1)

| State | Key strings |
|---|---|
| GATE | Q pattern: "Did you sell any shares, mutual funds or crypto this year?" · Why: "Selling investments changes which form you need. We check so you never file the wrong one." |
| BLOCKED | "We can't file your case correctly yet — and we won't pretend we can." · "You'll need ITR-2. Here's the honest path: →" |
| COLLECT | Dropzone: "Upload your Form 16 — PDF is fine, even password-protected." · AIS nudge: "Recommended: your AIS catches income your employer doesn't know about." · Skip attestation: "I'll continue without AIS — I understand unreported income can trigger a notice." |
| EXTRACT | Outcome: "Form 16 read ✓ Salary ₹12,65,000 · Tax already paid ₹80,000 · 2 fields need your confirmation." · Failure: "We couldn't read this PDF. Type in 4 numbers instead — takes a minute." |
| RECONCILE | Card: "Your AIS shows ₹42,000 in dividends that your Form 16 doesn't. That's normal — employers don't know about your investments." · Buttons: **Add it** / **Keep mine** / **This is wrong** · Empty: "Everything matches — Form 16, AIS and 26AS all agree. That's the best start possible." |
| CONFIRM | Field chip: "From Form 16 · Part B" · Low-confidence: "We're not fully sure we read this right. One look?" |
| COMPUTE | Hero: "Your refund: ₹80,000" / neutral: "Tax to pay: ₹1,640" · Verdict: "The new regime saves you ₹18,400. We checked both." · Chip: "Estimate · AY 2026-27" · Trace line style: "Rebate u/s 87A: −₹59,000 — your income is under ₹12 lakh, so this tax is waived." |
| RISK | Card: "You skipped AIS. If the tax dept knows about income you haven't reported, they'll send a notice — usually 6–18 months later. Most are resolvable, but it's a headache." · Ack: "I understand" |
| ENTITLE | Trigger transparency: "Why AI Smart? Your share sale (LTCG ₹75,000) needs checks Basic doesn't cover. That's the honest reason." · Fail-closed banner: "Payments are temporarily down. Your work is saved — we'll email you the moment it's back." |
| COMPANION | Step: "On the portal, you're on 'Gross Salary'. Enter ₹12,65,000 — copy button below." · Delta: "Portal shows something different? Tell us — don't guess." |
| FILED | "One last step: e-verify within 30 days or the return doesn't count. Aadhaar OTP takes 2 minutes." |
| VERIFIED | "Done. Actually done. 🎉 Most refunds arrive in 2–5 weeks — we'll be honest: it's the tax department's timeline, not ours." |
| LAPSED | "Your return isn't verified — after 30 days it's treated as never filed. It's fixable right now, in 2 minutes." |

## 4. Error message standard

Pattern: **what happened → what it means for you → the one next step.** Never a raw code, never `alert()` (current checkout violation), never a dead end.

> ❌ "Error 422: validation failed"
> ✓ "That PAN doesn't look right — it should be 10 characters like ABCDE1234F. Check your PAN card?"

## 5. Fear-handling rules (RISK & notices)

1. Name the fear before explaining ("Notices sound scary. Most are simple mismatches — here's yours in plain language.").
2. Always quantify: probability band + typical timeline + effort to fix.
3. Give the user an action, not just a warning.
4. Never use fear to sell: risk copy may not appear on ENTITLE. (The paywall argues value, not fear.)

## 6. Honesty invariants (lint-able)

- `Estimate` chip on every computed number, all surfaces including marketing.
- Connector labels only from status config (`Live/Beta/Soon`) — copy can't promise what code can't parse.
- Reviews/testimonials: real+consented or visually distinct "Example scenario" framing.
- One brand casing: **LastMinute ITR** (prose) / `LastMinuteITR` (wordmark).
- One price per plan sitewide, rendered by `AmountDisplay` from `plans.ts` only.
- "You file it yourself — we prepare and guide" appears on: landing hero, ENTITLE, COMPANION entry (the companion-not-efile positioning, doc 00).

## 7. Hindi & bilingual path (V2, planned now so V1 copy survives translation)

- V1 ships EN with Hinglish-tolerant vocabulary (avoid idioms that don't translate: "rain check", "ballpark").
- All strings externalized from day one (no literals in JSX) — the translation cost is a file, not a refactor.
- Number words ("twelve lakh") already Indian-English; Hindi copy keeps ₹-figures in digits.
- Priority order for translation: GATE → RISK → COMPANION (fear surfaces first, marketing last).

## 8. Acceptance checklist (Phase 4 gate, this doc)

- [ ] Dictionary reviewed by 1 CA (terms legally safe) + 2 target users (terms actually clearer)
- [ ] All V1 canonical strings in a single reviewed strings file before Phase 7
- [ ] Banned-words list wired into CI copy lint (extend `lib/copy/__tests__/trust.test.ts`)
- [ ] Error-message pattern applied to every existing API error surface (audit pass)
