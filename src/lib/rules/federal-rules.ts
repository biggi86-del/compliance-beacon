import { FederalRule } from '../types';
import { createHash } from 'crypto';
function hash(s: string): string { return createHash('sha256').update(s).digest('hex').slice(0, 16); }

export const FEDERAL_RULES: FederalRule[] = [
  { jurisdiction:'FEDERAL',rule_id:'FED-TP-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'IRS_PUBLICATION',source_reference:'IRS Publication 15 (Circular E), 2026 — Tip Income Reporting',source_url:'https://www.irs.gov/publications/p15',source_hash:hash('FED-TP-2026-001-v1'),rule_type:'TP',description:'W-2 Box 12 Code TP: Report qualified tips only. Mandatory service charges are NOT tips and must be excluded.',parameters:{monthly_tip_reporting_threshold:20,service_charge_excluded:true,tip_credit_max_per_hour:5.12,federal_minimum_wage:7.25,tipped_minimum_wage:2.13,social_security_rate:0.062,medicare_rate:0.0145,additional_medicare_threshold:200000,additional_medicare_rate:0.009}},
  { jurisdiction:'FEDERAL',rule_id:'FED-TT-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'IRS_PUBLICATION',source_reference:'IRS Publication 15 (Circular E), 2026 — OT Premium under OBBBA',source_url:'https://www.irs.gov/publications/p15',source_hash:hash('FED-TT-2026-001-v1'),rule_type:'TT',description:'W-2 Box 12 Code TT: Overtime premium is the 0.5x portion only. Base OT at straight-time NOT included.',parameters:{overtime_threshold_weekly_hours:40,overtime_multiplier:1.5,premium_portion:0.5,qualified_overtime_only:true}},
  { jurisdiction:'FEDERAL',rule_id:'FED-PENALTY-2026-001',version:1,effective_from:'2026-01-01',effective_to:null,source_type:'IRS_PUBLICATION',source_reference:'IRC §6721/6722 — Penalties for Incorrect Information Returns (2026 indexed)',source_url:'https://www.irs.gov/government-entities/federal-state-local-governments/increase-in-information-return-penalties',source_hash:hash('FED-PENALTY-2026-001-v1'),rule_type:'PENALTY',description:'$680 penalty per incorrect/missing W-2 for 2026 (inflation-adjusted).',parameters:{penalty_per_return:680,small_business_max_penalty:2379000,correction_window_days:30,reduced_penalty_30day:60,reduced_penalty_aug1:130}},
  { jurisdiction:'FEDERAL',rule_id:'FED-TP-2026-001',version:0,effective_from:'2025-01-01',effective_to:'2025-12-31',source_type:'IRS_PUBLICATION',source_reference:'IRS Publication 15 (Circular E), 2025',source_url:'https://www.irs.gov/publications/p15',source_hash:hash('FED-TP-2025-001-v0'),rule_type:'TP',description:'W-2 Box 12 Code TP (2025 prior version).',parameters:{monthly_tip_reporting_threshold:20,service_charge_excluded:true,tip_credit_max_per_hour:5.12,federal_minimum_wage:7.25,tipped_minimum_wage:2.13,social_security_rate:0.062,medicare_rate:0.0145,additional_medicare_threshold:200000,additional_medicare_rate:0.009}},
];

export function getFederalRule(ruleType: 'TP'|'TT'|'PENALTY', asOfDate: string): FederalRule | null {
  const d = new Date(asOfDate);
  const matching = FEDERAL_RULES.filter(r => {
    if (r.rule_type !== ruleType) return false;
    const from = new Date(r.effective_from);
    const to = r.effective_to ? new Date(r.effective_to) : new Date('9999-12-31');
    return d >= from && d <= to;
  }).sort((a, b) => b.version - a.version);
  return matching[0] ?? null;
}

export function getAllFederalRules(): FederalRule[] { return [...FEDERAL_RULES]; }
