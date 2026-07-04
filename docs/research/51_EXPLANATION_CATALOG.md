# 51 — Explanation Catalog (Phase 5, Executed)

> The registry of deterministic explanation templates. Each is keyed to an engine **trace rule id** (doc 22 §3, Finding 4) or a **validation id** (doc 31), filled by L2 with real Fact/trace values, optionally warmed by L3. This catalog is what "the AI explains your tax" actually means — and why it can't hallucinate: **if a rule id has no template, the AI says "I can't explain this yet" and links support.**

## 1. Template contract

```
id:        rule id it explains (matches engine trace / validation catalog)
params:    named values the engine trace must supply (all ₹-amounts come from here)
template:  doc-42-voice string with {placeholders}
expander:  the jargon layer (section number, one-paragraph depth)
```

Rendering rule: a template renders **only** if every param resolves from the trace/factset. Partial data → template does not render → generic provenance line instead. No default values, ever.

## 2. V1 catalog — computation traces (engine `rulesets.py` / `tax_slabs.py`)

| id | Template (EN v1) | Expander |
|---|---|---|
| `slab_tax.new` | "On ₹{taxable}, the new-regime slabs add up to ₹{slab_tax}." | slab-by-slab table from trace lines |
| `slab_tax.old` | "On ₹{taxable}, the old-regime slabs add up to ₹{slab_tax}." | slab table + age-based exemption note |
| `rebate_87a.applied` | "Your income (₹{total_income}) is under ₹{limit}, so ₹{rebate} of tax is waived. That's the Section 87A rebate." | s.87A, cap {cap}, new-regime AY 2026-27 |
| `rebate_87a.denied` | "Your income (₹{total_income}) is over ₹{limit}, so the tax waiver doesn't apply this year." | s.87A threshold; marginal-relief pointer |
| `rebate_87a.marginal_relief` | "You're just over ₹{limit}. A special rule caps your tax at ₹{max_tax} — the amount you're over by — instead of ₹{tax_before}. You save ₹{relief}." | proviso to s.87A |
| `special_rate.ltcg_112a` | "Profit from shares/MF held over a year: ₹{gain}. The first ₹{exemption} is tax-free; the rest is taxed at 12.5% = ₹{tax}." | s.112A; **rebate never offsets this** note |
| `special_rate.stcg_111a` | "Short-term share profits of ₹{gain} are taxed at a flat 20% = ₹{tax}, separate from your salary slabs." | s.111A |
| `surcharge.applied` | "Because total income exceeds ₹{threshold}, a {rate}% surcharge of ₹{surcharge} applies." | bands table; new-regime 25% cap |
| `cess` | "A 4% health & education cess of ₹{cess} applies on the tax — everyone pays this." | s.4 HEC |
| `std_deduction.new` | "₹{amount} standard deduction — automatic for salaried, nothing to claim." | s.16(ia), new regime ₹75,000 |
| `regime.verdict` | "The {winner} regime saves you ₹{saving}. We computed both — old: ₹{old_tax}, new: ₹{new_tax}." | breakeven-deduction figure from comparison |
| `late_fee.234f` | "Filing after 31 July adds a ₹{fee} late fee. Your exact number, not a range." | s.234F tiers |
| `net.refund` | "You paid ₹{paid} through the year; you owe ₹{tax}. The difference — ₹{refund} — comes back to you." | refund timeline expectations |
| `net.payable` | "You owe ₹{tax}; ₹{paid} is already paid. ₹{payable} remains — payable before you file." | self-assessment tax challan pointer |

## 3. V1 catalog — reconcile issues (doc 33 taxonomy, 7 kinds)

One headline template per kind; params from the issue record: `missing_in_return` ("Your {source} shows ₹{amount} {income_kind} your Form 16 doesn't. That's normal — employers don't know about your investments.") · `amount_mismatch` · `missing_in_ais` · `duplicate` · `tan_mismatch` · `period_split` · `classification`. Resolution buttons are fixed strings (doc 42 §3 RECONCILE).

## 4. V1 catalog — validations (doc 31)

Every `warn`+ validation in the V1 set of 180 gets a card template: what it found → what happens if ignored (quantified: probability band, timeline, effort) → the one action. Written in the doc 42 §5 fear-handling pattern. Priority order for authoring: TAX-* and TDS-* (money) → GAT-* (routing) → DED-* (deductions) → rest.

## 5. "Why we ask" catalog (GATE + CONFIRM)

One-liner per gate question and per confirm field group — extends the existing `WHY_WE_ASK` constants (`lib/copy/trust.ts`), which is the right pattern already shipped. Example: gate.capital_gains → "Selling investments changes which form you need. We check so you never file the wrong one."

## 6. Authoring & review pipeline

1. Engineer adds trace rule id in engine → CI fails if no catalog entry (coverage test: every rule id emitted by golden scenarios has a template).
2. Copy reviewed against doc 42 (voice, banned words — lint).
3. CA reviews legal accuracy of the expander layer per release.
4. L3 warmth pass is optional and validated: same params, same citations, blocklist-checked; failed validation → template verbatim.

## 7. Acceptance checklist (Phase 5 gate)

- [ ] Every trace rule id emitted by the engine on golden families A–B has a catalog entry (CI-enforced)
- [ ] CA sign-off on expander layer for the 14 computation templates
- [ ] Coverage test wired: unknown rule id → honest "can't explain yet" path renders
- [ ] Reconcile + validation templates authored for every V1-blocking check before Phase 7 exit
