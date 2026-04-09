import { getAllFederalRules } from '@/lib/rules/federal-rules';
import { getAllStateRules, getAvailableStates } from '@/lib/rules/state-modules';

export default function RulesPage() {
  const federalRules = getAllFederalRules();
  const stateRules = getAllStateRules();
  const states = getAvailableStates();
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Rules Registry</h1>
      <p className="text-gray-400 mb-8">Effective-dated, versioned compliance rules with full provenance.</p>
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Federal Rules ({federalRules.length})</h2>
        <div className="space-y-4">{federalRules.map(r=>(
          <div key={r.rule_id+r.version} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-blue-400 text-sm">{r.rule_id}</span>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">v{r.version}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${r.rule_type==='TP'?'bg-green-500/20 text-green-300 border border-green-500/30':r.rule_type==='TT'?'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30':'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{r.rule_type}</span>
              <span className="text-xs text-gray-500">{r.effective_from} → {r.effective_to||'Current'}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{r.description}</p>
            <div className="text-xs text-gray-500">Source: {r.source_reference}</div>
          </div>
        ))}</div>
      </section>
      {states.map(state=>{
        const rules = stateRules.filter(r=>r.state_code===state);
        return (
          <section key={state} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{state==='CA'?'California':state==='NY'?'New York':'Washington'} ({rules.length} rules)</h2>
            <div className="space-y-4">{rules.map(r=>(
              <div key={r.rule_id+r.version} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-300">{r.rule_id}</span>
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">{r.rule_type}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{r.description}</p>
                <div className="text-xs text-gray-500">Source: {r.source_reference}</div>
              </div>
            ))}</div>
          </section>
        );
      })}
    </div>
  );
}
