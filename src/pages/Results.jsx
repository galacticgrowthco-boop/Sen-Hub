import { useLocation, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, RefreshCcw, Download, ExternalLink, TrendingUp, Coffee, Bell, ShieldCheck } from 'lucide-react';
import { calculateEntitlements } from '../utils/matchingEngine';

const Results = () => {
  const location = useLocation();
  const answers = location.state?.answers || {};
  const donationRef = useRef(null);
  const [showPremiumNotice, setShowPremiumPremiumNotice] = useState(false);

  const { entitlements, comparison } = calculateEntitlements(answers);
  
  const likelyResults = entitlements.filter(r => r.status === 'likely' && r.category !== 'Education Support');
  const educationSupport = entitlements.filter(r => r.category === 'Education Support');
  const otherResults = entitlements.filter(r => r.status !== 'likely' && r.status !== 'unlikely' && r.category !== 'Education Support');
  const unlikelyResults = entitlements.filter(r => r.status === 'unlikely');

  const isCurrentlyWorking = answers.is_working === 'yes';

  const scrollToDonation = () => {
    setShowPremiumPremiumNotice(true);
    donationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Your Entitlement Summary</h2>
            <p className="text-slate-500 text-lg">We've found {entitlements.length} potential entitlements based on your answers.</p>
          </div>

          {comparison && comparison.showComparison && (
            <section className="bg-indigo-900 rounded-3xl p-8 text-white space-y-8 shadow-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-indigo-300" />
                <h3 className="text-2xl font-bold">Better-off in Work Calculation</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Working Scenario */}
                <div className={`space-y-4 p-6 rounded-2xl border ${isCurrentlyWorking ? 'bg-indigo-800 border-indigo-400 ring-2 ring-indigo-400' : 'bg-white/10 border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Working Scenario</h4>
                    {isCurrentlyWorking && <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                  </div>
                  <div className="space-y-2">
                    <p className="flex justify-between text-sm"><span>Monthly Earnings</span> <span className="font-mono font-bold">£{comparison.working.earnings.toFixed(2)}</span></p>
                    <p className="flex justify-between text-sm"><span>Benefits (Estimated)</span> <span className="font-mono font-bold">£{comparison.working.benefits.toFixed(2)}</span></p>
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <p className="flex justify-between text-xs text-rose-300"><span>Tax & NI (Est.)</span> <span className="font-mono">-£{comparison.working.tax.toFixed(2)}</span></p>
                      <p className="flex justify-between text-xs text-rose-300"><span>Childcare Spend</span> <span className="font-mono">-£{comparison.working.childcare.toFixed(2)}</span></p>
                      <p className="flex justify-between text-xs text-rose-300"><span>Commuting</span> <span className="font-mono">-£{comparison.working.commute.toFixed(2)}</span></p>
                    </div>
                    <div className="pt-2 border-t border-white/20 flex justify-between items-baseline">
                      <span className="font-bold">Net Monthly</span>
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono">£{comparison.working.net.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Not Working Scenario */}
                <div className={`space-y-4 p-6 rounded-2xl border ${!isCurrentlyWorking ? 'bg-indigo-800 border-indigo-400 ring-2 ring-indigo-400' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Not Working Scenario</h4>
                    {!isCurrentlyWorking && <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                  </div>
                  <div className="space-y-2">
                    <p className="flex justify-between text-sm"><span>Monthly Earnings</span> <span className="font-mono font-bold">£0.00</span></p>
                    <p className="flex justify-between text-sm"><span>Benefits (Estimated)</span> <span className="font-mono font-bold">£{comparison.notWorking.benefits.toFixed(2)}</span></p>
                    <p className="flex justify-between text-sm text-slate-400"><span>Costs</span> <span className="font-mono font-bold">£0.00</span></p>
                    <div className="pt-2 border-t border-white/20 flex justify-between items-baseline text-indigo-100">
                      <span className="font-bold">Net Monthly</span>
                      <span className="text-3xl font-extrabold font-mono">£{comparison.notWorking.net.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <p className="text-indigo-100 text-lg">
                  {comparison.working.net > comparison.notWorking.net ? (
                    <>You are <span className="text-emerald-400 font-bold">£{(comparison.working.net - comparison.notWorking.net).toFixed(2)}</span> better off per month by working.</>
                  ) : (
                    <>You are <span className="text-rose-400 font-bold">£{(comparison.notWorking.net - comparison.working.net).toFixed(2)}</span> worse off per month by working.</>
                  )}
                </p>
                <p className="text-[10px] text-indigo-400 mt-3">
                  This calculation is based on 2026-27 benefit rates and tax rules. It includes help with childcare costs through Universal Credit where applicable.
                </p>
              </div>
            </section>
          )}

          <div className="space-y-12">
            {likelyResults.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  High Likelihood
                </h3>
                <div className="grid gap-6">
                  {likelyResults.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}

            {educationSupport.length > 0 && (
              <section className="space-y-6 bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Education Support
                </h3>
                <div className="grid gap-6">
                  {educationSupport.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}

            <div className="my-8">
              {/* Google AdSense Slot */}
              <div id="adsense-slot" className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
                <span className="text-xs uppercase tracking-widest font-bold">Sponsored Content</span>
              </div>
            </div>

            {otherResults.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-500" />
                  Worth Checking
                </h3>
                <div className="grid gap-6">
                  {otherResults.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}

            {unlikelyResults.length > 0 && (
              <section className="space-y-6 opacity-60">
                <h3 className="text-xl font-bold text-slate-800">Unlikely at this time</h3>
                <div className="grid gap-6">
                  {unlikelyResults.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 sticky top-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Get your report</h3>
              <p className="text-slate-500 text-sm">
                Get a personalized PDF report with full breakdown and application links.
              </p>
            </div>
            <button 
              onClick={scrollToDonation}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Download className="w-5 h-5" />
              Download Report (£4.99)
            </button>
            
            <div ref={donationRef} className="pt-6 border-t border-slate-100 space-y-4">
              {showPremiumNotice && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-indigo-700 text-sm font-medium animate-pulse">
                  Premium reports are coming soon! In the meantime, please consider supporting our work with a donation.
                </div>
              )}
              <div className="flex items-center gap-3 text-amber-600">
                <Coffee className="w-6 h-6" />
                <h4 className="font-bold">Buy us a coffee</h4>
              </div>
              <p className="text-slate-500 text-xs">
                SEN Compass is free to use. If it helped you find support, consider a small donation.
              </p>
              <button className="w-full bg-amber-50 text-amber-700 px-4 py-3 rounded-xl font-semibold hover:bg-amber-100 transition-colors border border-amber-200 flex items-center justify-center gap-2">
                Donate via Ko-fi
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {/* Google AdSense Sidebar Slot */}
              <div id="adsense-sidebar" className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
                <span className="text-xs uppercase tracking-widest font-bold">Advertisement</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Bell className="w-5 h-5" />
                  <span className="font-bold text-sm">Stay Updated</span>
                </div>
                <p className="text-indigo-600 text-[10px] leading-relaxed font-medium uppercase tracking-wider">
                  Premium Subscription
                </p>
                <p className="text-slate-600 text-xs">
                  Get alerts whenever benefit rates change or new grants open.
                </p>
                <p className="text-indigo-700 font-bold">£19 / year</p>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                  Subscribe Now
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-12">
        <Link
          to="/calculator"
          className="inline-flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="w-5 h-5" />
          Start Over
        </Link>
      </div>
    </div>
  );
};

const ResultCard = ({ result }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 space-y-4">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            result.category === 'Education Support' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {result.category}
          </span>
          <h3 className="text-xl font-bold text-slate-900">{result.name}</h3>
        </div>
        {result.amount && (
          <p className="text-indigo-600 font-bold text-2xl mt-1">
            {result.amount} <span className="text-sm font-normal text-slate-400">per {result.period}</span>
          </p>
        )}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
        result.status === 'likely' ? 'bg-emerald-50 text-emerald-700' : 
        result.status === 'check' ? 'bg-indigo-50 text-indigo-700' :
        result.status === 'info' ? 'bg-blue-50 text-blue-700' :
        'bg-slate-50 text-slate-500'
      }`}>
        {result.status}
      </span>
    </div>
    <p className="text-slate-600 leading-relaxed">{result.description}</p>
    {result.details && (
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
        {result.details.map((detail, index) => (
          <p key={index} className="text-sm text-slate-500 flex justify-between">
            {detail}
          </p>
        ))}
      </div>
    )}
    {result.gateway_to && (
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway to:</p>
        <div className="flex flex-wrap gap-2">
          {result.gateway_to.map((item, index) => (
            <span key={index} className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-1 rounded-md border border-indigo-100">
              {item}
            </span>
          ))}
        </div>
      </div>
    )}
    {result.warning && (
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-3 text-sm text-amber-800">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>{result.warning}</p>
      </div>
    )}
    {result.official_url && (
      <a 
        href={result.official_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:underline"
      >
        How to apply <ExternalLink className="w-3 h-3" />
      </a>
    )}
  </div>
);

export default Results;
