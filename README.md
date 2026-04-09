# ComplianceBeacon — 2026 OBBBA Payroll Compliance Engine

🔴 **LIVE APP:** [https://qsjpoojzuuvipetotfrr.supabase.co/functions/v1/compliance-engine](https://qsjpoojzuuvipetotfrr.supabase.co/functions/v1/compliance-engine)

## What This Does

ComplianceBeacon validates W-2 Box 12 Code **TP** (Qualified Tips) and Code **TT** (Overtime Premium) against 2026 federal and state rules. It detects **$680 penalty risks** per IRC §6721/6722 per incorrect W-2.

## Stack
- **Engine:** TypeScript rules engine with effective-dated, versioned rule objects
- **App:** Next.js 15 + Tailwind CSS v4
- **Database:** Supabase (13 tables, full RLS, immutable audit logs)
- **Payments:** Stripe (Starter $49/mo, Pro $149/mo)
- **Deployment:** Supabase Edge Functions (live) + Vercel-ready

## Rules Engine

| Rule ID | Type | Description |
|---------|------|-------------|
| FED-TP-2026-001 | TP | Qualified tips only. Service charges excluded. |
| FED-TT-2026-001 | TT | Overtime premium (0.5x portion only). |
| FED-PENALTY-2026-001 | PENALTY | $680 per incorrect W-2 for 2026. |

### State Modules
- **CA** — No tip credit (§351), $16.50 min wage, daily OT
- **NY** — Tip credit allowed (regional), $15-16/hr min wage
- **WA** — No tip credit (RCW 49.46.160), $16.66 min wage

## Tests: 10/10 Passing

| # | Scenario | Status |
|---|----------|--------|
| 1 | Federal TT — OT premium calc | ✅ |
| 2 | Federal TP — Qualified tips | ✅ |
| 3 | Service charge exclusion | ✅ |
| 4 | CA tip scenario | ✅ |
| 5 | NY min wage violation | ✅ |
| 6 | WA no tip credit | ✅ |
| 7 | Mixed-state missing module | ✅ |
| 8 | RULE_MODULE_UNAVAILABLE | ✅ |
| 9 | Malformed CSV row-level errors | ✅ |
| 10 | Rule version rollover | ✅ |

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm test         # Run 10 test scenarios
```

## API

```bash
# POST — Run compliance analysis
curl https://qsjpoojzuuvipetotfrr.supabase.co/functions/v1/compliance-engine \\
  -X POST -H \"Content-Type: application/json\" \\
  -d '{\"csv\": \"employee_id,employee_name,...\"}'
```

## Stripe Payment Links
- **Starter ($49/mo):** https://buy.stripe.com/test_aFa5kEdp78RM4rp21J8so00
- **Pro ($149/mo):** https://buy.stripe.com/test_bJeaEY84Ngke8HFfSz8so01

## Leads
56 SMB payroll CPA leads in `LEADS.csv` covering 16 states.
