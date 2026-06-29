'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, CheckCircle2, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === 'panshulsingh38@gmail.com';
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [region, setRegion] = useState<'india' | 'intl'>('intl');

  useEffect(() => {
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data.country === 'IN') {
          setRegion('india');
        } else {
          setRegion('intl');
        }
      })
      .catch(err => console.error('Failed to detect country', err));
  }, []);

  const pricing = {
    india: {
      mini: "₹50",
      starter: "₹249",
      midterm: "₹599",
      finals: "₹1249"
    },
    intl: {
      mini: "$2.99",
      starter: "$6.99",
      midterm: "$14.99",
      finals: "$29.99"
    }
  };

  const handleCheckout = async (packId: string) => {
    try {
      setLoadingId(packId);

      const isScriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoadingId(null);
        return;
      }
      
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, region })
      });
      
      if (res.status === 401) {
        alert("You must be signed in to purchase more insights! Redirecting to login...");
        window.location.href = "/api/auth/signin?callbackUrl=/";
        return;
      }
      
      const orderData = await res.json();
      
      if (orderData.error) {
        alert(orderData.error);
        setLoadingId(null);
        return;
      }
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Aether Learning',
        description: `Purchase Insights (${packId})`,
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packId
            })
          });
          
          if (verifyRes.ok) {
            window.location.reload();
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Student',
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
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
            <div className="bg-[#13131a] border border-nord-3 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-nord-8/20 blur-[60px]" />
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-nord-4 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 rounded-full bg-nord-8/20 border border-nord-8/30 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Refill your Insights</h3>
                <p className="text-nord-4 mb-6 text-sm">
                  Choose a pack that fits your study schedule.
                </p>

                {isAdmin && (
                  <div className="flex p-1 bg-nord-1 rounded-xl mb-6 w-full max-w-[200px] mx-auto border border-nord-3">
                    <button
                      onClick={() => setRegion('india')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${region === 'india' ? 'bg-nord-14 text-white shadow-md' : 'text-nord-4 hover:text-white'}`}
                    >
                      🇮🇳 INR
                    </button>
                    <button
                      onClick={() => setRegion('intl')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${region === 'intl' ? 'bg-nord-14 text-white shadow-md' : 'text-nord-4 hover:text-white'}`}
                    >
                      🌍 USD
                    </button>
                  </div>
                )}

                <div className="w-full flex flex-col gap-3 mb-6">
                  {/* Mini Pack */}
                  <button 
                    onClick={() => handleCheckout('mini')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/20 rounded-2xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">Mini Pack</span>
                      </div>
                      <p className="text-sm text-emerald-200/70">25 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-white">{pricing[region].mini}</span>
                      {loadingId === 'mini' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 transition-colors"><CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" /></div>}
                    </div>
                  </button>

                  {/* Starter Pack */}
                  <button 
                    onClick={() => handleCheckout('starter')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-nord-1 border border-nord-3 hover:border-nord-14/50 hover:bg-nord-2 rounded-2xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-white" />
                        <span className="font-bold text-white">Starter Pack</span>
                      </div>
                      <p className="text-sm text-nord-4">50 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-white">{pricing[region].starter}</span>
                      {loadingId === 'starter' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-8 h-8 rounded-full bg-nord-8/20 flex items-center justify-center group-hover:bg-nord-14 transition-colors"><CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" /></div>}
                    </div>
                  </button>

                  {/* Midterm Cram Pack */}
                  <button 
                    onClick={() => handleCheckout('midterm')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-nord-8/10 border border-nord-8/30 hover:border-nord-14 hover:bg-nord-8/20 rounded-2xl p-4 text-left transition-all flex items-center justify-between shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  >
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-nord-14 text-xs font-bold rounded-full text-white">Most Popular</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 mt-1">
                        <BookOpen className="w-4 h-4 text-white" />
                        <span className="font-bold text-white">Midterm Cram Pack</span>
                      </div>
                      <p className="text-sm text-nord-4">150 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xl font-bold text-white">{pricing[region].midterm}</span>
                      {loadingId === 'midterm' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-8 h-8 rounded-full bg-nord-14 flex items-center justify-center shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                    </div>
                  </button>

                  {/* Finals Season Pack */}
                  <button 
                    onClick={() => handleCheckout('finals')}
                    disabled={loadingId !== null}
                    className="relative group w-full bg-nord-1 border border-nord-3 hover:border-nord-3/50 hover:bg-nord-2 rounded-2xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-nord-4" />
                        <span className="font-bold text-white">Finals Season Pack</span>
                      </div>
                      <p className="text-sm text-nord-4">500 AI Insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-white">{pricing[region].finals}</span>
                      {loadingId === 'finals' ? <Loader2 className="w-5 h-5 animate-spin text-pink-500" /> : <div className="w-8 h-8 rounded-full bg-nord-15/20 flex items-center justify-center group-hover:bg-nord-15 transition-colors"><CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" /></div>}
                    </div>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Payments are securely processed by Razorpay. {region === 'intl' && 'Your card will be charged in USD equivalent.'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
