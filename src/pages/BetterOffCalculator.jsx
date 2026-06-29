import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, DollarSign, Clock, Briefcase, Info, ArrowRight, AlertCircle, PieChart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateEntitlements } from '../utils/matchingEngine';

const BetterOffCalculator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialAnswers = location.state?.answers || {};

  // Local state for the potential job offer
  const [potentialJob, setPotentialJob] = useState({
    salary: '25000',
    salaryType: 'annual', // annual or hourly
    hours: '37.5',
    childcare: '0',
    commuting: '0'
  });

  // Calculate results for both current and potential scenarios
  const results = useMemo(() => {
    // 1. Current Scenario (from initial answers)
    const currentResults = calculateEntitlements(initialAnswers);

    // 2. Potential Scenario
    // Adjust answers for the potential job
    const weeklyEarnings = potentialJob.salaryType === 'annual' 
      ? parseFloat(potentialJob.salary) / 52 
      : parseFloat(potentialJob.salary) * parseFloat(potentialJob.hours);
    
    const potentialAnswers = {
      ...initialAnswers,
      is_working: 'yes',
      weekly_earnings: weeklyEarnings.toString(),
      weekly_childcare_costs: potentialJob.childcare,
      weekly_transport_costs: potentialJob.commuting,
      commuting_method: 'other' // Simplify for this calc
    };

    const potentialResults = calculateEntitlements(potentialAnswers);

    return {
      current: currentResults,
      potential: potentialResults,
      weeklyEarnings
    };
  }, [initialAnswers, potentialJob]);

  if (!initialAnswers.num_children) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">No data found</h2>
          <p className="text-slate-600">Please complete the main entitlement check first so we have your baseline benefits info.</p>
        </div>
        <Link to="/calculator" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors">
          Go to Calculator
        </Link>
      </div>
    );
  }

  const currentNet = results.current.comparison.working.net;
  const potentialNet = results.potential.comparison.working.net;
  const difference = potentialNet - currentNet;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-700 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Results
      </button>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Work Comparison</h1>
            <p className="text-slate-500">Enter the details of a potential job offer to see how it affects your total household income.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">Salary / Wages</label>
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setPotentialJob({...potentialJob, salaryType: 'annual'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${potentialJob.salaryType === 'annual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Annual
                </button>
                <button 
                  onClick={() => setPotentialJob({...potentialJob, salaryType: 'hourly'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${potentialJob.salaryType === 'hourly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Hourly
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input 
                  type="number"
                  value={potentialJob.salary}
                  onChange={(e) => setPotentialJob({...potentialJob, salary: e.target.value})}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            {potentialJob.salaryType === 'hourly' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Hours per Week</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="number"
                    value={potentialJob.hours}
                    onChange={(e) => setPotentialJob({...potentialJob, hours: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Weekly Childcare Costs</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input 
                  type="number"
                  value={potentialJob.childcare}
                  onChange={(e) => setPotentialJob({...potentialJob, childcare: e.target.value})}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">UC covers up to 85% of these costs.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Weekly Commuting Costs</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input 
                  type="number"
                  value={potentialJob.commuting}
                  onChange={(e) => setPotentialJob({...potentialJob, commuting: e.target.value})}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              Impact on Benefits
            </h4>
            <ul className="text-xs text-indigo-700 space-y-3 leading-relaxed">
              <li>• <span className="font-bold">UC Taper:</span> Every £1 you earn reduces your UC by 55p (after work allowance).</li>
              <li>• <span className="font-bold">Carer's Allowance:</span> If you earn over £204/week, you lose this benefit entirely.</li>
              <li>• <span className="font-bold">DLA/PIP:</span> These are unaffected by your earnings.</li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-indigo-300 font-bold uppercase tracking-widest text-xs">The Bottom Line</h2>
                  <h3 className="text-4xl font-black">Net Monthly Difference</h3>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-xl shadow-lg ${difference >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {difference >= 0 ? '+' : '-'}£{Math.abs(difference).toFixed(2)}
                </div>
              </div>

              <p className="text-slate-300 text-lg max-w-xl">
                {difference > 0 ? (
                  <>You will be <span className="text-emerald-400 font-bold">£{difference.toFixed(2)} better off</span> per month by taking this job offer.</>
                ) : (
                  <>You would be <span className="text-rose-400 font-bold">£{Math.abs(difference).toFixed(2)} worse off</span> per month compared to your current situation.</>
                )}
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-slate-400 text-sm font-bold uppercase tracking-wider">
                    <span>Current Scenario</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">BASELINE</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold">£{currentNet.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-xs text-slate-400 italic">
                      <span>Earnings</span>
                      <span className="font-mono">£{results.current.comparison.working.earnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 italic">
                      <span>Benefits</span>
                      <span className="font-mono">£{results.current.comparison.working.benefits.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 border border-indigo-400/30 p-6 rounded-3xl space-y-4 ring-2 ring-indigo-500/20">
                  <div className="flex justify-between items-center text-indigo-300 text-sm font-bold uppercase tracking-wider">
                    <span>Potential Scenario</span>
                    <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded text-white animate-pulse">NEW JOB</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-emerald-400">£{potentialNet.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-xs text-slate-400 italic">
                      <span>Earnings</span>
                      <span className="font-mono">£{results.potential.comparison.working.earnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 italic">
                      <span>Benefits</span>
                      <span className="font-mono text-indigo-300">£{results.potential.comparison.working.benefits.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Detailed Breakdown
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <BreakdownTable 
                title="Monthly Gains" 
                items={[
                  { label: 'Take-home Pay', value: results.potential.comparison.working.earnings - results.potential.comparison.working.tax },
                  { label: 'Universal Credit', value: results.potential.comparison.working.benefits - (initialAnswers.existing_benefits?.includes('carers_allowance') ? 0 : 0) }, // Need careful logic here
                  { label: 'Child Benefit', value: results.potential.comparison.working.benefits > 0 ? 100 : 0, isPlaceholder: true } // Placeholder for demo
                ]}
                accentColor="emerald"
              />
              
              <BreakdownTable 
                title="Monthly Reductions" 
                items={[
                  { label: 'Childcare Costs', value: results.potential.comparison.working.childcare },
                  { label: 'Commuting', value: results.potential.comparison.working.commute },
                  { label: 'Income Tax & NI', value: results.potential.comparison.working.tax },
                  { label: 'Benefit Loss (CA/Taper)', value: Math.max(0, results.current.comparison.working.benefits - results.potential.comparison.working.benefits) }
                ]}
                accentColor="rose"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Career Advice for SEN Parents</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Flexible Working', desc: 'You have a legal right to request flexible working from day one.' },
                { title: 'Carer Element', desc: 'Working does NOT stop you from getting the UC Carer Element.' },
                { title: 'Work Allowance', desc: 'You keep more of your money before UC is reduced because of your child.' }
              ].map((tip, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <h4 className="font-bold text-indigo-600 text-sm">{tip.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BreakdownTable = ({ title, items, accentColor }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
    <div className={`px-6 py-4 bg-${accentColor}-50 border-b border-${accentColor}-100`}>
      <h4 className={`font-bold text-${accentColor}-700 text-sm uppercase tracking-wider`}>{title}</h4>
    </div>
    <table className="w-full text-sm">
      <tbody className="divide-y divide-slate-50">
        {items.map((item, i) => (
          <tr key={i} className={item.isPlaceholder ? 'opacity-40' : ''}>
            <td className="px-6 py-4 text-slate-600 font-medium">{item.label}</td>
            <td className={`px-6 py-4 text-right font-mono font-bold ${accentColor === 'emerald' ? 'text-emerald-600' : 'text-rose-600'}`}>
              £{item.value.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BetterOffCalculator;
