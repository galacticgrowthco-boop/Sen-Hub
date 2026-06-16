import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Heart, Gift, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import charityData from '../data/charity_grants_deep_dive.json';

const GrantsDirectory = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-700 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Results
      </button>

      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Charity Grants Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Beyond government benefits, there are many charities providing grants for equipment, holidays, and sensory items for children with SEN.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charityData.charity_grants.map((charity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden"
            >
              <div className="p-8 space-y-6 flex-grow">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    {charity.charity_name === 'Family Fund' ? <Heart /> : 
                     charity.grant_types?.includes('Equipment') ? <ShieldCheck /> : <Gift />}
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {charity.eligibility_rules?.income_limit ? 'Income Limit' : 'Needs Based'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">{charity.charity_name}</h2>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {charity.eligibility_rules?.description || 'Providing support and grants for disabled children and their families.'}
                  </p>
                </div>

                {charity.grant_types && (
                  <div className="flex flex-wrap gap-2">
                    {charity.grant_types.slice(0, 3).map((type, tIdx) => (
                      <span key={tIdx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                <a
                  href={charity.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 p-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 bg-white/10 rounded-full">
              <Users className="w-12 h-12" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold">Looking for something specific?</h2>
              <p className="text-slate-400">
                Turn2Us provides a comprehensive grant search tool that matches you with local and national charities based on your specific profession or location.
              </p>
            </div>
            <a 
              href="https://grants-search.turn2us.org.uk/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whitespace-nowrap px-8 py-4 bg-indigo-600 rounded-full font-bold hover:bg-indigo-700 transition-colors"
            >
              Search All Grants
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantsDirectory;
