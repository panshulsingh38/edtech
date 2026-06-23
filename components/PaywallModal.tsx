'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, CheckCircle2, Loader2, BookOpen, GraduationCap } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (packId: string) => {
    try {
      setLoadingId(packId);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
        setLoadingId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[60px]" />
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-white mb-2">Out of Insights!</h2>
                <p className="text-gray-400 mb-8">
                  You've used your free insights. Refill your brainpower with a one-time pack to keep generating!
                </p>

                <div className="w-full flex flex-col gap-3 mb-6">
                  {/* Starter Pack */}
                  <button 
                    onClick={() => handleCheckout('starter')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 rounded-2xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white">Starter Pack</span>
                      </div>
                      <p className="text-sm text-gray-400">50 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-white">$3</span>
                      {loadingId === 'starter' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500 transition-colors"><CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" /></div>}
                    </div>
                  </button>

                  {/* Midterm Cram Pack */}
                  <button 
                    onClick={() => handleCheckout('midterm')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/20 rounded-2xl p-4 text-left transition-all flex items-center justify-between shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  >
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-xs font-bold rounded-full text-white">Most Popular</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 mt-1">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white">Midterm Cram Pack</span>
                      </div>
                      <p className="text-sm text-indigo-200">150 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xl font-bold text-white">$7</span>
                      {loadingId === 'midterm' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                    </div>
                  </button>

                  {/* Finals Season Pack */}
                  <button 
                    onClick={() => handleCheckout('finals')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 rounded-2xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-pink-400" />
                        <span className="font-bold text-white">Finals Season Pack</span>
                      </div>
                      <p className="text-sm text-gray-400">500 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-white">$15</span>
                      {loadingId === 'finals' ? <Loader2 className="w-5 h-5 animate-spin text-pink-500" /> : <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500 transition-colors"><CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" /></div>}
                    </div>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">Payments are securely processed by Stripe.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
