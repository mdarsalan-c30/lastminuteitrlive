# Quicko CTA Map — June 2026 audit

**Sources:** Live fetch of [quicko.com](https://quicko.com/), [learn.quicko.com](https://learn.quicko.com/), uploaded snapshot `quicko.com-0.md`, browser spot-check (signin 404).

**Limitation:** Filing app behind auth; `/signin` returns 404 — login likely at app subdomain or glyde app.

---

## Primary navigation

| Label | Destination | Notes |
|-------|-------------|-------|
| Personal | quicko.com (home) | Consumer tax product |
| Accountant | quicko.com/accountant (inferred) | B2B / CA partner |
| Resources | Footer + Learn hub | Help Center, Tools & Calculators |
| Help | help.quicko.com | Save · Pay · File KB |
| Log in / Sign in | App auth (not public `/signin`) | Browser: 404 at quicko.com/signin |

---

## Hero & above-fold CTAs

| CTA | URL / action | Persona |
|-----|--------------|---------|
| Start for free | Filing app signup | All |
| Refund amount widget | Interactive hero demo | Salaried |
| download glyde | Mobile app QR | All |

---

## Persona carousel (Save · Pay · File)

| Persona tab | Visual hook | Implied CTA |
|-------------|-------------|-------------|
| Salaried | Form 16 scan, salary breakdown, refund notification | File ITR |
| Investor & Trader | Portfolio P&L, broker connect | Connect broker |
| Freelancer | Foreign income card, e-file success | Start filing |
| NRI | NRE summary, broker logos | Connect account |
| Solopreneur | Advance tax calendar, B&P turnover | Discover tax savings |

---

## Save / Pay / File bands

| Pillar | Headline | Primary CTA |
|--------|----------|-------------|
| Save | Life, meet tax savings | Discover tax savings |
| Pay | Pay taxes your way | Make first tax payment |
| File | File your own taxes with confidence | Start filing |

---

## Product & upsell CTAs

| CTA | Context |
|-----|---------|
| Connect account / Track portfolio / Share tax P&L | Broker import strip |
| Explore / Book a Tax Expert | Expert tier (Meet) |
| Get this plan (Basic/Essential/Elite) | Pricing: Free / ₹799 / ₹999 |
| Compare all plans | Pricing footer |
| Start for free (footer) | Repeat conversion |

---

## Footer legal cluster

| Page | Path |
|------|------|
| Privacy Policy | quicko.com (footer) |
| Terms & Conditions | quicko.com (footer) |
| Regulatory Disclosure | quicko.com (footer) |
| Trust Site | Resources |
| Sitemap | quicko.com/sitemap |

---

## Resources destinations (footer)

- Help Center → help.quicko.com
- Tools & Calculators → learn.quicko.com tools
- Learn → learn.quicko.com
- Tax Q&A → community / Quora positioning
- Newsletter subscribe + Explore Community

---

## Pricing anchors (reference only — do not copy verbatim)

| Plan | Price | Gate |
|------|-------|------|
| Basic | Free | Income ≤ ₹5L, salary/HP/IFOS |
| Essential | ₹799 | CG + B&P, income ≤ ₹15L |
| Elite | ₹999 | All sources incl. foreign |

---

## LastMinute mapping

| Quicko pattern | Our route / component |
|----------------|----------------------|
| Start for free | `/file/import/documents?source=form16` |
| Persona carousel | `ScenarioHooksSection` + `INDIAN_USE_CASES` |
| Save/Pay/File pillars | `/learn` pillars + `/help` (companion framing) |
| Tools hub | `/tools` |
| Expert tier | CA Review plan (soon) in pricing |
| 2.2M users scale proof | Honest beta framing — no fake volume |
