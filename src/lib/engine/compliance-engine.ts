// ComplianceBeacon — Core Compliance Engine
// Box 12 Code TP (Tips) + Code TT (OT Premium) + $680 Penalty Detection
// See full source in Supabase Edge Function for the live deployed version
import { v4 as uuidv4 } from 'uuid';
import { PayrollRow, TaxCalculation, Discrepancy, CSVValidationError, EngineResult, RuleProvenance } from '../types';
import { getFederalRule } from '../rules/federal-rules';
import { getStateRules, isStateModuleAvailable } from '../rules/state-modules';

const REQUIRED_COLUMNS = ['employee_id','employee_name','pay_period_start','pay_period_end','state','hours_regular','hours_overtime','hourly_rate','gross_wages','tips_reported','service_charges','overtime_premium_paid','federal_withholding','state_withholding','social_security','medicare'];

function validateRow(row: Record<string,string>, rowNum: number): {parsed:PayrollRow|null; errors:CSVValidationError[]} {
  const errors: CSVValidationError[] = [];
  for (const col of REQUIRED_COLUMNS) { if (!(col in row)||row[col]===undefined||row[col]==='') errors.push({row_number:rowNum,column:col,value:'',error:`Missing required column: ${col}`}); }
  if (errors.length>0) return {parsed:null,errors};
  const numFs=['hours_regular','hours_overtime','hourly_rate','gross_wages','tips_reported','service_charges','overtime_premium_paid','federal_withholding','state_withholding','social_security','medicare'];
  for (const f of numFs) { const v=parseFloat(row[f]); if(isNaN(v)) errors.push({row_number:rowNum,column:f,value:row[f],error:`Invalid numeric value: "${row[f]}"`}); else if(v<0) errors.push({row_number:rowNum,column:f,value:row[f],error:`Negative value not allowed: ${v}`}); }
  for (const df of ['pay_period_start','pay_period_end']) { if(isNaN(new Date(row[df]).getTime())) errors.push({row_number:rowNum,column:df,value:row[df],error:`Invalid date: "${row[df]}"`}); }
  if (row.state&&!/^[A-Z]{2}$/.test(row.state.toUpperCase())) errors.push({row_number:rowNum,column:'state',value:row.state,error:`Invalid state code: "${row.state}"`});
  if (errors.length>0) return {parsed:null,errors};
  return { parsed:{row_number:rowNum,employee_id:row.employee_id.trim(),employee_name:row.employee_name.trim(),pay_period_start:row.pay_period_start.trim(),pay_period_end:row.pay_period_end.trim(),state:row.state.trim().toUpperCase(),hours_regular:+row.hours_regular,hours_overtime:+row.hours_overtime,hourly_rate:+row.hourly_rate,gross_wages:+row.gross_wages,tips_reported:+row.tips_reported,service_charges:+row.service_charges,overtime_premium_paid:+row.overtime_premium_paid,federal_withholding:+row.federal_withholding,state_withholding:+row.state_withholding,social_security:+row.social_security,medicare:+row.medicare}, errors:[] };
}

function calculateTP(row:PayrollRow,asOf:string):{tp:number;rule:RuleProvenance|null} { const r=getFederalRule('TP',asOf); return {tp:row.tips_reported,rule:r}; }
function calculateTT(row:PayrollRow,asOf:string):{tt:number;rule:RuleProvenance|null} { const r=getFederalRule('TT',asOf); if(!r) return {tt:0,rule:null}; return {tt:Math.round(row.hours_overtime*row.hourly_rate*(r.parameters.premium_portion as number)*100)/100,rule:r}; }

function validateStateCompliance(row:PayrollRow,asOf:string):{discrepancies:Discrepancy[];rules:RuleProvenance[];unavailable:boolean} {
  const discs:Discrepancy[]=[],rules:RuleProvenance[]=[];
  if(!isStateModuleAvailable(row.state)) return {discrepancies:[],rules:[],unavailable:true};
  const sr=getStateRules(row.state,asOf); if(!sr||!sr.length) return {discrepancies:[],rules:[],unavailable:true};
  for(const rule of sr) { rules.push(rule);
    if(rule.rule_type==='MINIMUM_WAGE'){const mw=(rule.parameters.minimum_wage??rule.parameters.state_minimum_wage??rule.parameters.rest_of_state_minimum_wage) as number; if(row.hourly_rate<mw) discs.push({id:uuidv4(),severity:'CRITICAL',rule_id:rule.rule_id,jurisdiction:rule.jurisdiction,employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:mw,actual_value:row.hourly_rate,delta:mw-row.hourly_rate,explanation:`Hourly rate $${row.hourly_rate} below ${rule.jurisdiction} min wage $${mw}/hr.`,created_at:new Date().toISOString()});}
    if(rule.rule_type==='TIP_CREDIT'&&!(rule.parameters.tip_credit_allowed as boolean)){const sm=(rule.parameters.state_minimum_wage??rule.parameters.nyc_minimum_wage) as number; if(sm&&row.hourly_rate<sm) discs.push({id:uuidv4(),severity:'CRITICAL',rule_id:rule.rule_id,jurisdiction:rule.jurisdiction,employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:sm,actual_value:row.hourly_rate,delta:sm-row.hourly_rate,explanation:`${rule.jurisdiction} prohibits tip credits. Must pay $${sm}/hr. Current: $${row.hourly_rate}/hr.`,created_at:new Date().toISOString()});}
    if(rule.rule_type==='OVERTIME'&&row.hours_overtime>0){const exp=row.hours_overtime*row.hourly_rate*((rule.parameters.overtime_multiplier as number)-1);const d=Math.abs(exp-row.overtime_premium_paid);if(d>1) discs.push({id:uuidv4(),severity:d>50?'ERROR':'WARNING',rule_id:rule.rule_id,jurisdiction:rule.jurisdiction,employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:Math.round(exp*100)/100,actual_value:row.overtime_premium_paid,delta:Math.round(d*100)/100,explanation:`${rule.jurisdiction} OT mismatch. Expected $${exp.toFixed(2)}, got $${row.overtime_premium_paid.toFixed(2)}.`,created_at:new Date().toISOString()});}
  }
  return {discrepancies:discs,rules,unavailable:false};
}

export function runComplianceEngine(rawRows:Record<string,string>[],asOfDate='2026-06-15'):EngineResult {
  const calculations:TaxCalculation[]=[],discrepancies:Discrepancy[]=[],csvErrors:CSVValidationError[]=[];
  const rulesApplied=new Map<string,RuleProvenance>(),unavailableModules=new Set<string>();
  let validRows=0,errorRows=0;

  for(let i=0;i<rawRows.length;i++){
    const rowNum=i+2;const{parsed,errors}=validateRow(rawRows[i],rowNum);
    if(errors.length>0){csvErrors.push(...errors);errorRows++;continue;}
    if(!parsed){errorRows++;continue;} validRows++;const row=parsed;

    const{tp,rule:tpRule}=calculateTP(row,asOfDate); if(tpRule) rulesApplied.set(tpRule.rule_id+'-v'+tpRule.version,tpRule);
    const{tt,rule:ttRule}=calculateTT(row,asOfDate); if(ttRule) rulesApplied.set(ttRule.rule_id+'-v'+ttRule.version,ttRule);

    if(row.service_charges>0) discrepancies.push({id:uuidv4(),severity:'INFO',rule_id:'FED-TP-2026-001',jurisdiction:'FEDERAL',employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:0,actual_value:row.service_charges,delta:row.service_charges,explanation:`$${row.service_charges.toFixed(2)} service charges excluded from TP.`,created_at:new Date().toISOString()});

    const ttDelta=Math.abs(tt-row.overtime_premium_paid);
    if(ttDelta>1&&row.hours_overtime>0) discrepancies.push({id:uuidv4(),severity:ttDelta>100?'ERROR':'WARNING',rule_id:'FED-TT-2026-001',jurisdiction:'FEDERAL',employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:tt,actual_value:row.overtime_premium_paid,delta:Math.round(ttDelta*100)/100,explanation:`TT mismatch. Expected $${tt.toFixed(2)} (${row.hours_overtime}hrs x $${row.hourly_rate} x 0.5), reported $${row.overtime_premium_paid.toFixed(2)}.`,created_at:new Date().toISOString()});

    const penaltyRule=getFederalRule('PENALTY',asOfDate); if(penaltyRule) rulesApplied.set(penaltyRule.rule_id+'-v'+penaltyRule.version,penaltyRule);
    const hasPenalty=ttDelta>1&&row.hours_overtime>0;
    if(hasPenalty) discrepancies.push({id:uuidv4(),severity:'CRITICAL',rule_id:'FED-PENALTY-2026-001',jurisdiction:'FEDERAL',employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:0,actual_value:680,delta:680,explanation:`$680 penalty risk (IRC 6721/6722) for incorrect TT W-2 reporting.`,created_at:new Date().toISOString()});

    const stateResult=validateStateCompliance(row,asOfDate);
    if(stateResult.unavailable) unavailableModules.add(row.state);
    discrepancies.push(...stateResult.discrepancies);
    for(const sr of stateResult.rules) rulesApplied.set(sr.rule_id+'-v'+sr.version,sr);

    const tc=row.gross_wages+row.tips_reported; const ess=Math.round(tc*0.062*100)/100; const emc=Math.round(tc*0.0145*100)/100;
    const ssDelta=Math.abs(ess-row.social_security);
    if(ssDelta>1) discrepancies.push({id:uuidv4(),severity:ssDelta>50?'ERROR':'WARNING',rule_id:'FED-TP-2026-001',jurisdiction:'FEDERAL',employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,expected_value:ess,actual_value:row.social_security,delta:Math.round(ssDelta*100)/100,explanation:`SS mismatch. Expected $${ess.toFixed(2)} (6.2% of $${tc.toFixed(2)}), got $${row.social_security.toFixed(2)}.`,created_at:new Date().toISOString()});

    calculations.push({id:uuidv4(),employee_id:row.employee_id,pay_period:`${row.pay_period_start}/${row.pay_period_end}`,jurisdiction:row.state,box12_code_tp:tp,box12_code_tt:tt,expected_federal_withholding:row.federal_withholding,expected_state_withholding:row.state_withholding,expected_ss:ess,expected_medicare:emc,penalty_risk_amount:hasPenalty?680:0,penalty_risk_flag:hasPenalty,rule_ids_applied:Array.from(rulesApplied.keys())});
  }

  for(const state of unavailableModules) discrepancies.push({id:uuidv4(),severity:'WARNING',rule_id:'RULE_MODULE_UNAVAILABLE',jurisdiction:state,employee_id:'ALL',pay_period:'ALL',expected_value:0,actual_value:0,delta:0,explanation:`State module for ${state} not available. Only federal rules applied.`,created_at:new Date().toISOString()});

  return {calculations,discrepancies,csv_errors:csvErrors,rules_applied:Array.from(rulesApplied.values()),unavailable_modules:Array.from(unavailableModules),summary:{total_rows:rawRows.length,valid_rows:validRows,error_rows:errorRows,total_discrepancies:discrepancies.length,critical_count:discrepancies.filter(d=>d.severity==='CRITICAL').length,warning_count:discrepancies.filter(d=>d.severity==='WARNING').length,penalty_risk_total:discrepancies.filter(d=>d.rule_id==='FED-PENALTY-2026-001').reduce((s,d)=>s+d.actual_value,0)}};
}
