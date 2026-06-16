import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const DLAGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Focus on 'Substantially More'",
      icon: <Info className="w-6 h-6 text-indigo-600" />,
      content: "The DWP doesn't just care about the diagnosis. They care about how much more help your child needs compared to a child of the same age without their condition. Be specific about the extra time you spend."
    },
    {
      title: "Keep a Diary",
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      content: "Track a typical 24-hour period. Note down every time you help them with things like dressing, eating, managing behavior, or getting back to sleep at night. Often we do these things automatically and forget how much they add up."
    },
    {
      title: "Describe their 'Worst Days'",
      icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
      content: "Don't just describe a 'good' day. Describe what happens on their most difficult days. Use phrases like 'on a bad day' or 'when they are overwhelmed'."
    },
    {
      title: "Provide Evidence",
      icon: <CheckCircle2 className="w-6 h-6 text-indigo-600" />,
      content: "Include reports from doctors, therapists, teachers, or SENCOs. If they have an EHCP, include that. Evidence from people who see your child regularly is vital."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-700 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Results
      </button>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Tips for a Successful DLA Claim</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Applying for Disability Living Allowance (DLA) can be an exhausting process. Here is some guidance to help you get the support your child deserves.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-6">
          <h2 className="text-2xl font-bold">Recommended Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a 
              href="https://www.contact.org.uk/help-for-families/financial-support-for-children/benefits/disability-living-allowance/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
            >
              <span className="font-semibold">Contact DLA Guide</span>
              <ExternalLink className="w-5 h-5" />
            </a>
            <a 
              href="https://www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/disability-living-allowance-dla/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
            >
              <span className="font-semibold">Citizens Advice DLA</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DLAGuide;
