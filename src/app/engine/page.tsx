'use client';
import { useState } from 'react';
import { SAMPLE_CSV } from '@/lib/sample-data';

export default function EnginePage() {
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('calcs');
  const sevColor: Record<string,string> = {CRITICAL:'bg-red-500/20 text-red-400 border-red-500/30',ERROR:'bg-orange-500/20 text-orange-400 border-orange-500/30',WARNING:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',INFO:'bg-blue-500/20 text-blue-400 border-blue-500/30'};

  const run = async () => {
    if (!csv.trim()) { setError('Paste CSV first.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch('/api/engine', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({csv}) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Engine error');
      setResult(d); setTab('calcs');
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Compliance Engine</h1>
      <p className="text-gray-400 mb-6">Upload payroll CSV to analyze TP/TT compliance and detect penalty risks.</p>
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Payroll Data (CSV)</h2>
          <button onClick={()=>setCsv(SAMPLE_CSV)} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg">Load Sample Data</button>
        </div>
        <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={8} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-4 text-sm font-mono text-gray-300 focus:border-blue-500 focus:outline-none" placeholder="Paste CSV here..."/>
        <div className="mt-3 flex items-center gap-4">
          <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold">{loading?'Analyzing...':'Run Compliance Engine'}</button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>
      {result && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {[{l:'Rows',v:result.summary.total_rows,c:'text-white'},{l:'Valid',v:result.summary.valid_rows,c:'text-green-400'},{l:'Errors',v:result.summary.error_rows,c:result.summary.error_rows>0?'text-red-400':'text-gray-500'},{l:'Issues',v:result.summary.total_discrepancies,c:'text-yellow-400'},{l:'Critical',v:result.summary.critical_count,c:result.summary.critical_count>0?'text-red-400':'text-gray-500'},{l:'Warnings',v:result.summary.warning_count,c:'text-yellow-400'},{l:'Penalty',v:'$'+result.summary.penalty_risk_total,c:result.summary.penalty_risk_total>0?'text-red-400':'text-green-400'}].map(s=><div key={s.l} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center"><div className={`text-xl font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>)}
          </div>
          {result.unavailable_modules.length>0 && <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4 text-yellow-300">RULE_MODULE_UNAVAILABLE: {result.unavailable_modules.join(', ')}</div>}
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-4">
            {['calcs','disc','errs','rules'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${tab===t?'bg-blue-600 text-white':'text-gray-400 hover:bg-gray-800'}`}>{t==='calcs'?'Calculations':t==='disc'?`Discrepancies (${result.discrepancies.length})`:t==='errs'?`CSV Errors (${result.csv_errors.length})`:'Rules'}</button>)}
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            {tab==='calcs' && <table className="w-full text-sm"><thead className="bg-gray-800/50 text-gray-400"><tr><th className="px-4 py-3 text-left">Employee</th><th className="px-4 py-3 text-left">Period</th><th className="px-4 py-3">State</th><th className="px-4 py-3 text-right">TP (Tips)</th><th className="px-4 py-3 text-right">TT (OT)</th><th className="px-4 py-3 text-right">Penalty</th></tr></thead><tbody className="divide-y divide-gray-800">{result.calculations.map((c:any,i:number)=><tr key={i} className="hover:bg-gray-800/30"><td className="px-4 py-2 font-mono">{c.employee_id}</td><td className="px-4 py-2 text-gray-400 text-xs">{c.pay_period}</td><td className="px-4 py-2 text-center">{c.jurisdiction}</td><td className="px-4 py-2 text-right font-mono text-green-400">${c.box12_code_tp.toFixed(2)}</td><td className="px-4 py-2 text-right font-mono text-cyan-400">${c.box12_code_tt.toFixed(2)}</td><td className="px-4 py-2 text-right">{c.penalty_risk_flag?<span className="text-red-400 font-semibold">${c.penalty_risk_amount}</span>:<span className="text-green-400">OK</span>}</td></tr>)}</tbody></table>}
            {tab==='disc' && <div>{result.discrepancies.length===0?<div className="p-6 text-center text-gray-500">No discrepancies.</div>:result.discrepancies.map((d:any)=><div key={d.id} className="p-4 border-b border-gray-800"><span className={`px-2 py-0.5 rounded text-xs font-semibold border ${sevColor[d.severity]||''}`}>{d.severity}</span><span className="font-mono text-sm text-gray-300 ml-2">{d.rule_id}</span><span className="text-gray-500 text-sm ml-2">{d.jurisdiction} / {d.employee_id}</span><p className="text-sm text-gray-300 mt-1">{d.explanation}</p>{d.delta!==0&&<div className="text-xs text-gray-500 mt-1">Expected: ${d.expected_value.toFixed(2)} | Actual: ${d.actual_value.toFixed(2)} | Delta: ${d.delta.toFixed(2)}</div>}</div>)}</div>}
            {tab==='errs' && <div>{result.csv_errors.length===0?<div className="p-6 text-center text-gray-500">No CSV errors.</div>:result.csv_errors.map((e:any,i:number)=><div key={i} className="p-3 border-b border-gray-800 text-sm"><span className="text-red-400 font-mono">Row {e.row_number}</span> {e.column}: {e.error}</div>)}</div>}
            {tab==='rules' && <div>{result.rules_applied.map((r:any,i:number)=><div key={i} className="p-4 border-b border-gray-800"><span className="font-mono text-blue-400 text-sm">{r.rule_id}</span><span className="text-xs text-gray-500 ml-2">{r.jurisdiction}</span><p className="text-sm text-gray-400 mt-1">{r.description}</p></div>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
