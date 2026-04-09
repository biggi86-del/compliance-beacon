import Link from 'next/link';

const plans = [
  { name:'Starter', price:49, desc:'For small firms starting with one state', features:['1 state module (CA, NY, or WA)','Federal TP & TT validation','$680 penalty risk detection','Up to 500 employees/month','CSV upload & analysis','Email support'], cta:'Start with Starter', href:'https://buy.stripe.com/test_aFa5kEdp78RM4rp21J8so00', popular:false },
  { name:'Pro', price:149, desc:'For multi-state payroll operations', features:['All state modules (CA, NY, WA + future)','Federal TP & TT validation','$680 penalty risk detection','Unlimited employees','CSV upload & analysis','Audit log exports','API access','Priority support'], cta:'Go Pro', href:'https://buy.stripe.com/test_bJeaEY84Ngke8HFfSz8so01', popular:true },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-400">Eliminate $680/W-2 penalty risks for less than the cost of one mistake.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map(plan=>(
          <div key={plan.name} className={`relative rounded-2xl p-8 ${plan.popular?'bg-gradient-to-b from-blue-600/20 to-blue-900/20 border-2 border-blue-500/50':'bg-gray-900/50 border border-gray-800'}`}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>}
            <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
            <div className="mb-6"><span className="text-4xl font-bold">${plan.price}</span><span className="text-gray-400">/month</span></div>
            <ul className="space-y-3 mb-8">{plan.features.map(f=><li key={f} className="flex items-start gap-2 text-sm"><span className="text-green-400 mt-0.5">✓</span><span className="text-gray-300">{f}</span></li>)}</ul>
            <a href={plan.href} target="_blank" rel="noopener noreferrer" className={`block text-center py-3 rounded-lg font-semibold transition ${plan.popular?'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25':'bg-gray-800 hover:bg-gray-700 text-white'}`}>{plan.cta}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
