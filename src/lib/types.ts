export type Severity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type SourceType = 'IRS_PUBLICATION' | 'STATE_STATUTE' | 'REGULATION' | 'REVENUE_RULING' | 'ADMINISTRATIVE_GUIDANCE';

export interface RuleProvenance {
  jurisdiction: string;
  rule_id: string;
  version: number;
  effective_from: string;
  effective_to: string | null;
  source_type: SourceType;
  source_reference: string;
  source_url: string;
  source_hash: string;
}

export interface FederalRule extends RuleProvenance {
  rule_type: 'TP' | 'TT' | 'PENALTY';
  description: string;
  parameters: Record<string, number | string | boolean>;
}

export interface StateRule extends RuleProvenance {
  state_code: string;
  rule_type: 'TIP_CREDIT' | 'MINIMUM_WAGE' | 'OVERTIME' | 'TIP_POOLING' | 'REPORTING';
  description: string;
  parameters: Record<string, number | string | boolean>;
}

export interface PayrollRow {
  row_number: number;
  employee_id: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  state: string;
  hours_regular: number;
  hours_overtime: number;
  hourly_rate: number;
  gross_wages: number;
  tips_reported: number;
  service_charges: number;
  overtime_premium_paid: number;
  federal_withholding: number;
  state_withholding: number;
  social_security: number;
  medicare: number;
}

export interface TaxCalculation {
  id: string;
  employee_id: string;
  pay_period: string;
  jurisdiction: string;
  box12_code_tp: number;
  box12_code_tt: number;
  expected_federal_withholding: number;
  expected_state_withholding: number;
  expected_ss: number;
  expected_medicare: number;
  penalty_risk_amount: number;
  penalty_risk_flag: boolean;
  rule_ids_applied: string[];
}

export interface Discrepancy {
  id: string;
  severity: Severity;
  rule_id: string;
  jurisdiction: string;
  employee_id: string;
  pay_period: string;
  expected_value: number;
  actual_value: number;
  delta: number;
  explanation: string;
  created_at: string;
}

export interface CSVValidationError {
  row_number: number;
  column: string;
  value: string;
  error: string;
}

export interface EngineResult {
  calculations: TaxCalculation[];
  discrepancies: Discrepancy[];
  csv_errors: CSVValidationError[];
  rules_applied: RuleProvenance[];
  unavailable_modules: string[];
  summary: {
    total_rows: number;
    valid_rows: number;
    error_rows: number;
    total_discrepancies: number;
    critical_count: number;
    warning_count: number;
    penalty_risk_total: number;
  };
}
