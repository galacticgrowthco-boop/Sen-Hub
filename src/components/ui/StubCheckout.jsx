import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

const StubCheckout = ({ isOpen, onClose, item, amount, onComplete }) => {
  const [step, setStep] = useState('details'); // details, processing, success

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      if (onComplete) onComplete();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Secure Checkout</h3>
                  <p className="text-slate-500">You are purchasing: <span className="font-semibold text-slate-700">{item}</span></p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">{amount}</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Details (Stub)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly
                        value="4242 4242 4242 4242"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</label>
                      <input type="text" readOnly value="12/26" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CVC</label>
                      <input type="text" readOnly value="***" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-mono" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Payments are processed securely via our stub provider.
                </div>

                <button
                  onClick={handlePay}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Pay {amount}
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20" />
                  <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Processing Payment</h3>
                  <p className="text-slate-500 text-sm">Please don't close this window...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
                  <p className="text-slate-500">Thank you for your support. Your {item} is now available.</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default StubCheckout;
