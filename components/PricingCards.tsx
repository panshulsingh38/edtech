'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const TIERS = [
  {
    id: 'mini',
    name: 'Mini Pack',
    insights: 25,
    price: 50,
    features: ['25 AI Generation Insights', 'Standard Speed', 'Email Support'],
    color: 'bg-nord-3',
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    insights: 50,
    price: 249,
    features: ['50 AI Generation Insights', 'Priority Queue', '24/7 Support'],
    color: 'bg-nord-14',
    popular: true,
  },
  {
    id: 'midterm',
    name: 'Midterm Prep',
    insights: 150,
    price: 599,
    features: ['150 AI Generation Insights', 'Lightning Speed', 'Advanced Analytics', 'Priority Support'],
    color: 'bg-nord-10',
  },
  {
    id: 'finals',
    name: 'Finals Mastery',
    insights: 500,
    price: 1249,
    features: ['500 AI Generation Insights', 'Unlimited Storage', 'White-glove Support', 'Early Access Features'],
    color: 'bg-nord-15',
  }
];

export default function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const handlePayment = async (packId: string, insights: number) => {
    setLoading(packId);
    try {
      // 0. Admin Bypass
      if (isAdmin) {
        const res = await fetch('/api/admin/add-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ insights })
        });
        if (res.ok) {
          alert('Admin bypass successful! Insights added for free.');
          window.location.reload();
          return;
        }
      }

      // 1. Create order on the server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to initialize checkout. Please ensure you are logged in.');
        setLoading(null);
        if (res.status === 401) router.push('/auth/signin');
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: 'AetherLearning',
        description: `${insights} AI Insights Pack`,
        order_id: data.id,
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              insightsToAdd: insights
            })
          });
          
          if (verifyRes.ok) {
            alert('Payment successful! Your insights have been added.');
            window.location.reload();
          } else {
            alert('Payment verification failed.');
          }
        },
        theme: {
          color: '#A3BE8C'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert(response.error.description);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {TIERS.map((tier) => (
          <div 
            key={tier.id} 
            className={`relative flex flex-col p-8 rounded-3xl border bg-nord-1 ${tier.popular ? 'border-nord-14 shadow-lg shadow-nord-14/20 scale-105 z-10' : 'border-nord-2'}`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-nord-14 text-nord-0 text-sm font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Most Popular
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-white">₹{tier.price}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-8 p-4 rounded-xl bg-nord-0 border border-nord-2">
              <Zap className={`w-6 h-6 text-nord-13`} />
              <div>
                <div className="font-bold text-white">{tier.insights} Insights</div>
                <div className="text-xs text-nord-4">Generate up to {tier.insights} AI tests</div>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-nord-14 shrink-0" />
                  <span className="text-sm text-nord-4">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment(tier.id, tier.insights)}
              disabled={loading === tier.id}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                tier.popular 
                  ? 'bg-nord-14 hover:bg-[#b5d09f] text-nord-0' 
                  : 'bg-nord-2 hover:bg-nord-3 text-white'
              }`}
            >
              {loading === tier.id ? <Loader2 className="w-5 h-5 animate-spin" /> : isAdmin ? 'Add Free (Admin)' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
