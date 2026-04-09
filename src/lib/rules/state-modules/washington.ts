import { StateRule } from '../../types';
import { createHash } from 'crypto';
function hash(s: string): string { return createHash('sha256').update(s).digest('hex').slice(0, 16); }

export const WA_RULES: StateRule[] = [
  { jurisdiction:'WA',state_code:'WA',rule_id:'WA-TIP-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'RCW 49.46.160 — Tips; No tip credits',source_url:'https://app.leg.wa.gov/RCW/default.aspx?cite=49.46.160',source_hash:hash('WA-TIP-v1'),rule_type:'TIP_CREDIT',description:'WA prohibits tip credits. Full $16.66 min wage required.',parameters:{tip_credit_allowed:false,tip_credit_amount:0,state_minimum_wage:16.66,applies_to_all_employers:true}},
  { jurisdiction:'WA',state_code:'WA',rule_id:'WA-MW-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'RCW 49.46.020 — Minimum Wage 2026',source_url:'https://lni.wa.gov/workers-rights/wages/minimum-wage/',source_hash:hash('WA-MW-v1'),rule_type:'MINIMUM_WAGE',description:'WA 2026 min wage: $16.66/hr (CPI). Seattle $20.76 large, $18.76 small.',parameters:{state_minimum_wage:16.66,seattle_large_employer_min:20.76,seattle_small_employer_min:18.76,seatac_min:19.71}},
  { jurisdiction:'WA',state_code:'WA',rule_id:'WA-OT-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'RCW 49.46.130 — Overtime',source_url:'https://lni.wa.gov/workers-rights/wages/overtime/',source_hash:hash('WA-OT-v1'),rule_type:'OVERTIME',description:'WA FLSA OT: 1.5x after 40hrs/week. No daily OT.',parameters:{weekly_overtime_threshold:40,overtime_multiplier:1.5,daily_overtime:false,agricultural_phase_in:true}},
  { jurisdiction:'WA',state_code:'WA',rule_id:'WA-TIPPOOL-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'REGULATION',source_reference:'WAC 296-126-040 — Tips and Service Charges',source_url:'https://app.leg.wa.gov/WAC/default.aspx?cite=296-126-040',source_hash:hash('WA-TIPPOOL-v1'),rule_type:'TIP_POOLING',description:'WA tip pooling allowed. Service charges must be disclosed — NOT tips.',parameters:{employer_participation_allowed:false,manager_participation_allowed:false,service_charge_is_not_tip:true,disclosure_required:true}},
];

export function getWashingtonRules(asOfDate: string): StateRule[] {
  const d = new Date(asOfDate);
  return WA_RULES.filter(r => { const f=new Date(r.effective_from); const t=r.effective_to?new Date(r.effective_to):new Date('9999-12-31'); return d>=f&&d<=t; });
}
