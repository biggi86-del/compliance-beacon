import { StateRule } from '../../types';
import { createHash } from 'crypto';
function hash(s: string): string { return createHash('sha256').update(s).digest('hex').slice(0, 16); }

export const CA_RULES: StateRule[] = [
  { jurisdiction:'CA',state_code:'CA',rule_id:'CA-TIP-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'California Labor Code §351',source_url:'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=351',source_hash:hash('CA-TIP-v1'),rule_type:'TIP_CREDIT',description:'CA prohibits tip credits. Full $16.50 min wage required before tips.',parameters:{tip_credit_allowed:false,tip_credit_amount:0,state_minimum_wage:16.50,applies_to_all_employers:true}},
  { jurisdiction:'CA',state_code:'CA',rule_id:'CA-MW-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'California Labor Code §1182.12',source_url:'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=1182.12',source_hash:hash('CA-MW-v1'),rule_type:'MINIMUM_WAGE',description:'CA 2026 minimum wage: $16.50/hr all employers.',parameters:{minimum_wage:16.50,fast_food_minimum_wage:20.00,healthcare_minimum_wage:25.00}},
  { jurisdiction:'CA',state_code:'CA',rule_id:'CA-OT-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'California Labor Code §510',source_url:'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510',source_hash:hash('CA-OT-v1'),rule_type:'OVERTIME',description:'CA daily OT: 1.5x>8hrs, 2x>12hrs. Weekly 1.5x>40hrs. 7th day rule.',parameters:{daily_overtime_threshold:8,daily_double_time_threshold:12,weekly_overtime_threshold:40,overtime_multiplier:1.5,double_time_multiplier:2.0,seventh_day_rule:true}},
  { jurisdiction:'CA',state_code:'CA',rule_id:'CA-TIPPOOL-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'STATE_STATUTE',source_reference:'California Labor Code §351 — Tip Pooling',source_url:'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=351',source_hash:hash('CA-TIPPOOL-v1'),rule_type:'TIP_POOLING',description:'CA tip pooling: direct service employees only. Employers/managers excluded.',parameters:{employer_participation_allowed:false,manager_participation_allowed:false,back_of_house_allowed:true}},
];

export function getCaliforniaRules(asOfDate: string): StateRule[] {
  const d = new Date(asOfDate);
  return CA_RULES.filter(r => { const f=new Date(r.effective_from); const t=r.effective_to?new Date(r.effective_to):new Date('9999-12-31'); return d>=f&&d<=t; });
}
