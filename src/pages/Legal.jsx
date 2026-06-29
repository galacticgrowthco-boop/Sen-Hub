import React, { useState } from 'react';
import { Shield, FileText, Accessibility, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Legal = () => {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Use', icon: FileText },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Nav */}
        <div className="md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[600px]">
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'terms' && <TermsOfUse />}
          {activeTab === 'accessibility' && <AccessibilityStatement />}
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicy = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="prose prose-slate max-w-none space-y-8"
  >
    <div className="space-y-2">
      <h2 className="text-3xl font-bold text-slate-900">Privacy Policy</h2>
      <p className="text-slate-500 text-sm">Last updated: June 18, 2026</p>
    </div>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">1. No Personal Data Storage</h3>
      <p className="text-slate-600 leading-relaxed">
        SEN Compass is designed with privacy as a core principle. We do <span className="font-bold text-slate-900">not</span> store any of the personal or financial information you enter into our calculators on our servers. 
      </p>
      <p className="text-slate-600 leading-relaxed">
        All calculations are performed locally in your browser. Once you close your browser tab, your data is cleared.
      </p>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">2. Cookies & Advertising</h3>
      <p className="text-slate-600 leading-relaxed">
        We use Google AdSense to serve advertisements. Google may use cookies to serve ads based on your prior visits to this or other websites. 
      </p>
      <p className="text-slate-600 leading-relaxed">
        You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" className="text-indigo-600 font-semibold hover:underline">Google Ad Settings</a>.
      </p>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">3. Analytics</h3>
      <p className="text-slate-600 leading-relaxed">
        We use basic, anonymized analytics to understand how many people use our tool. This does not include any information that could identify you or your family.
      </p>
    </section>
  </motion.div>
);

const TermsOfUse = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="prose prose-slate max-w-none space-y-8"
  >
    <div className="space-y-2">
      <h2 className="text-3xl font-bold text-slate-900">Terms of Use</h2>
      <p className="text-slate-500 text-sm">Last updated: June 18, 2026</p>
    </div>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">1. Information Only</h3>
      <p className="text-slate-600 leading-relaxed">
        The information provided by SEN Compass is for <span className="font-bold text-slate-900">educational and informational purposes only</span>. It does not constitute legal, financial, or professional advice.
      </p>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">2. Accuracy</h3>
      <p className="text-slate-600 leading-relaxed">
        While we strive to keep our benefit rates and rules up to date (currently using 2026-27 DWP projections), the UK benefits system is complex. Always verify your results with an official DWP or Local Authority representative before making financial decisions.
      </p>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">3. Limitation of Liability</h3>
      <p className="text-slate-600 leading-relaxed">
        SEN Compass and its creators are not liable for any financial loss or missed entitlements resulting from the use of this tool.
      </p>
    </section>
  </motion.div>
);

const AccessibilityStatement = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="prose prose-slate max-w-none space-y-8"
  >
    <div className="space-y-2">
      <h2 className="text-3xl font-bold text-slate-900">Accessibility Statement</h2>
      <p className="text-slate-500 text-sm">Our commitment to SEN parents.</p>
    </div>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Compliance Goal</h3>
      <p className="text-slate-600 leading-relaxed">
        We aim to make SEN Compass accessible to everyone, including parents who may have accessibility needs themselves. We target compliance with <span className="font-bold text-slate-900">WCAG 2.1 level AA</span>.
      </p>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Key Features</h3>
      <ul className="text-slate-600 space-y-2">
        <li>• High contrast text and clear semantic structure.</li>
        <li>• Fully navigable via keyboard.</li>
        <li>• Screen reader compatible tags and labels.</li>
        <li>• Mobile-first design for easy use on any device.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Feedback</h3>
      <p className="text-slate-600 leading-relaxed">
        If you encounter any difficulty using this site, please let us know so we can improve it for the entire SEN community.
      </p>
    </section>
  </motion.div>
);

export default Legal;
