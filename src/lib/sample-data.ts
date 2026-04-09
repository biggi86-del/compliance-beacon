export const SAMPLE_CSV = `employee_id,employee_name,pay_period_start,pay_period_end,state,hours_regular,hours_overtime,hourly_rate,gross_wages,tips_reported,service_charges,overtime_premium_paid,federal_withholding,state_withholding,social_security,medicare
E001,Alice Johnson,2026-01-01,2026-01-15,CA,80,10,20.00,1800.00,500.00,0.00,100.00,270.00,90.00,142.60,33.35
E002,Bob Smith,2026-01-01,2026-01-15,NY,80,8,18.00,1584.00,350.00,75.00,72.00,237.60,79.20,119.97,28.07
E003,Carol White,2026-01-01,2026-01-15,WA,80,5,22.00,1870.00,600.00,0.00,55.00,280.50,93.50,153.14,35.82
E004,Dave Brown,2026-01-01,2026-01-15,CA,80,12,16.50,1518.00,200.00,150.00,99.00,227.70,75.90,106.52,24.91
E005,Eve Davis,2026-01-01,2026-01-15,TX,80,6,15.00,1290.00,400.00,0.00,45.00,193.50,0.00,104.78,24.51
E006,Frank Miller,2026-01-01,2026-01-15,NY,80,0,14.00,1120.00,800.00,100.00,0.00,168.00,56.00,119.04,27.84`;

export const MALFORMED_CSV = `employee_id,employee_name,pay_period_start,pay_period_end,state,hours_regular,hours_overtime,hourly_rate,gross_wages,tips_reported,service_charges,overtime_premium_paid,federal_withholding,state_withholding,social_security,medicare
E100,Bad Row 1,2026-01-01,2026-01-15,CA,EIGHTY,10,20.00,1800.00,500.00,0.00,100.00,270.00,90.00,142.60,33.35
E101,,not-a-date,2026-01-15,XX,-5,10,20.00,1800.00,500.00,0.00,100.00,270.00,90.00,142.60,33.35
,Missing ID,2026-01-01,2026-01-15,CA,80,10,20.00,1800.00,500.00,0.00,100.00,270.00,90.00,142.60,33.35`;
