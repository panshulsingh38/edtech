import PricingCards from '@/components/PricingCards';

export default function UpgradePage() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 pt-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">Level Up Your Learning</h1>
        <p className="text-nord-4 text-xl max-w-2xl mx-auto">
          Out of AI insights? Refill your account to keep generating world-class interactive tests and assessments. Secure payments powered by Razorpay.
        </p>
      </div>
      
      <PricingCards />
    </div>
  );
}
