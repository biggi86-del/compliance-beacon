import { StateRule } from '../../types';
import { createHash } from 'crypto';
function hash(s: string): string { return createHash('sha256').update(s).digest('hex').slice(0, 16); }

export const NY_RULES: StateRule[] = [
  { jurisdiction:'NY',state_code:'NY',rule_id:'NY-TIP-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'NY Labor Law §196-d; 12 NYCRR Part 146',source_url:'https://dol.ny.gov/wages',source_hash:hash('NY-TIP-v1'),rule_type:'TIP_CREDIT',description:'NY allows tip credit. NYC $16/hr, rest of state $15/hr.',parameters:{tip_credit_allowed:true,nyc_tip_credit:5.00,nyc_tipped_minimum_wage:11.00,rest_of_state_tip_credit:4.35,rest_of_state_tipped_minimum_wage:10.65,nyc_minimum_wage:16.00,rest_of_state_minimum_wage:15.00}},
  { jurisdiction:'NY',state_code:'NY',rule_id:'NY-MW-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'NY Labor Law §652',source_url:'https://dol.ny.gov/minimum-wage-0',source_hash:hash('NY-MW-v1'),rule_type:'MINIMUM_WAGE',description:'NY 2026 min wage: $16/hr NYC, $15.50 Westchester/LI, $15 rest.',parameters:{nyc_minimum_wage:16.00,westchester_li_minimum_wage:15.50,rest_of_state_minimum_wage:15.00}},
  { jurisdiction:'NY',state_code:'NY',rule_id:'NY-OT-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'NY Labor Law §160',source_url:'https://dol.ny.gov/overtime-0',source_hash:hash('NY-OT-v1'),rule_type:'OVERTIME',description:'NY FLSA OT: 1.5x after 40hrs/week. Residential: 44hrs.',parameters:{weekly_overtime_threshold:40,residential_overtime_threshold:44,overtime_multiplier:1.5,daily_overtime:false}},
  { jurisdiction:'NY',state_code:'NY',rule_id:'NY-TIPPOOL-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'REGULATION',source_reference:'12 NYCRR §146-2.14',source_url:'https://dol.ny.gov/wages',source_hash:hash('NY-TIPPOOL-v1'),rule_type:'TIP_POOLING',description:'NY tip pooling among service employees. Employers/managers excluded.',parameters:{employer_participation_allowed:false,manager_participation_allowed:false,back_of_house_allowed:false,service_employees_only:true}},
];

export function getNewYorkRules(asOfDate: string): StateRule[] {
  const d = new Date(asOfDate);
  return NY_RULES.filter(r => { const f=new Date(r.effective_from); const t=r.effective_to?new Date(r.effective_to):new Date('9999-12-31'); return d>=f&&d<=t; });
}
