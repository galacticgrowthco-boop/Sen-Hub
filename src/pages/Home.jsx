import { Link } from 'react-router-dom';
import { ChevronRight, Calculator, ShieldCheck, HeartHandshake } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 py-8">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Find the financial support your <span className="text-indigo-600">SEN child</span> is entitled to.
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Navigating UK benefits can be overwhelming. We're here to help you find every grant, benefit, and support scheme you deserve.
        </p>
        <div className="flex justify-center">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Start Entitlement Check
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Smart Calculator</h3>
          <p className="text-slate-500">Matches your circumstances against DLA, PIP, Carer's Allowance, and more.</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Better-off in Work</h3>
          <p className="text-slate-500">Calculate how working affects your benefits so you can make informed decisions.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Empathetic Guidance</h3>
          <p className="text-slate-500">Step-by-step application advice written by parents for parents.</p>
        </div>
      </section>

      <section className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4 max-w-xl">
          <h3 className="text-3xl font-bold">Why use SEN Compass?</h3>
          <p className="text-indigo-100 text-lg">
            We built this because we've been there. Fragmented government sites and hidden entitlements mean families miss out on an average of £2,400 a year.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </section>
    </div>
  );
};

export default Home;
