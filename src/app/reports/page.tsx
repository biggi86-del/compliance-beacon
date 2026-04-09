'use client';
import { useState } from 'react';
import { SAMPLE_CSV, MALFORMED_CSV } from '@/lib/sample-data';

export default function ReportsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const call = async (csv: string, asOfDate?: string) => {
    const r = await fetch('/api/engine', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({csv, as_of_date:asOfDate||'2026-06-15'}) });
    return r.json();
  };

  const runTests = async () => {
    setRunning(true); const tests: any[] = [];
    try {
      const r = await call(SAMPLE_CSV);
      const e001 = r.calculations?.find((c:any)=>c.employee_id==='E001');
      tests.push({name:'1. Federal TT',status:e001&&Math.abs(e001.box12_code_tt-100)<0.01?'PASS':'FAIL',expected:'$100.00',actual:e001?'$'+e001.box12_code_tt.toFixed(2):'N/A'});
      tests.push({name:'2. Federal TP',status:e001&&e001.box12_code_tp===500?'PASS':'FAIL',expected:'$500.00',actual:e001?'$'+e001.box12_code_tp.toFixed(2):'N/A'});
      const e002 = r.calculations?.find((c:any)=>c.employee_id==='E002');
      tests.push({name:'3. Service Charge Exclusion',status:e002&&e002.box12_code_tp===350?'PASS':'FAIL',expected:'TP=$350',actual:e002?'TP=$'+e002.box12_code_tp.toFixed(2):'N/A'});
      tests.push({name:'4. CA Tip — No Credit',status:r.rules_applied?.some((x:any)=>x.rule_id==='CA-TIP-2026-001')?'PASS':'FAIL',expected:'CA rule applied',actual:r.rules_applied?.some((x:any)=>x.rule_id==='CA-TIP-2026-001')?'Yes':'No'});
      const e006d = r.discrepancies?.find((d:any)=>d.employee_id==='E006'&&d.jurisdiction==='NY');
      tests.push({name:'5. NY Min Wage',status:e006d?'PASS':'FAIL',expected:'E006 flagged ($14<$15)',actual:e006d?'Flagged':'Not flagged'});
      tests.push({name:'6. WA No Tip Credit',status:r.rules_applied?.some((x:any)=>x.rule_id==='WA-TIP-2026-001')?'PASS':'FAIL',expected:'WA rule applied',actual:r.rules_applied?.some((x:any)=>x.rule_id==='WA-TIP-2026-001')?'Yes':'No'});
      tests.push({name:'7. Mixed-State Unavailable',status:r.unavailable_modules?.includes('TX')&&r.unavailable_modules?.includes('FL')?'PASS':'FAIL',expected:'TX,FL unavailable',actual:r.unavailable_modules?.join(',')||'none'});
      tests.push({name:'8. Module Unavailable Emission',status:r.discrepancies?.filter((d:any)=>d.rule_id==='RULE_MODULE_UNAVAILABLE').length>=2?'PASS':'FAIL',expected:'>=2 emissions',actual:r.discrepancies?.filter((d:any)=>d.rule_id==='RULE_MODULE_UNAVAILABLE').length+' found'});
      const mr = await call(MALFORMED_CSV);
      tests.push({name:'9. Malformed CSV',status:mr.csv_errors?.length>0?'PASS':'FAIL',expected:'Errors found',actual:mr.summary?.error_rows+' error rows'});
      const r25 = await call(SAMPLE_CSV,'2025-06-15'); const r26 = await call(SAMPLE_CSV,'2026-06-15');
      const v25 = r25.rules_applied?.find((x:any)=>x.rule_id==='FED-TP-2026-001')?.version;
      const v26 = r26.rules_applied?.find((x:any)=>x.rule_id==='FED-TP-2026-001')?.version;
      tests.push({name:'10. Rule Rollover',status:v25===0&&v26===1?'PASS':'FAIL',expected:'v0→v1',actual:`v${v25}→v${v26}`});
    } catch(e:any) { tests.push({name:'Error',status:'FAIL',expected:'',actual:e.message}); }
    setResults(tests); setRunning(false);
  };

  const pass = results.filter(r=>r.status==='PASS').length;
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold mb-2">Test Reports</h1><p className="text-gray-400">10 required compliance scenarios</p></div>
        <button onClick={runTests} disabled={running} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold">{running?'Running...':'Run All 10 Tests'}</button>
      </div>
      {results.length>0 && (
        <div>
          <div className="flex gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2"><span className="text-green-400 font-bold text-xl">{pass}</span><span className="text-green-400 ml-2 text-sm">PASSED</span></div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2"><span className="text-red-400 font-bold text-xl">{results.length-pass}</span><span className="text-red-400 ml-2 text-sm">FAILED</span></div>
          </div>
          <div className="space-y-3">{results.map((t,i)=>(
            <div key={i} className={`border rounded-xl p-5 ${t.status==='PASS'?'bg-green-500/5 border-green-500/20':'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center gap-3 mb-2"><span>{t.status==='PASS'?'✅':'❌'}</span><span className="font-semibold">{t.name}</span><span className={`ml-auto text-sm font-mono ${t.status==='PASS'?'text-green-400':'text-red-400'}`}>{t.status}</span></div>
              <div className="grid md:grid-cols-2 gap-4 text-sm"><div><span className="text-gray-500 text-xs">EXPECTED</span><div className="text-gray-300 font-mono mt-0.5">{t.expected}</div></div><div><span className="text-gray-500 text-xs">ACTUAL</span><div className="text-gray-300 font-mono mt-0.5">{t.actual}</div></div></div>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  );
}
