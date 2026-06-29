import PricingCards from '@/components/PricingCards';
import { Lock } from 'lucide-react';

export default function GradesPage() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Grades & Analytics</h1>
        <p className="text-nord-4 text-lg">Track your performance and view detailed analytics.</p>
      </div>

      <div className="bg-nord-1 border border-nord-2 rounded-3xl p-10 text-center mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-nord-14/10 to-transparent pointer-events-none"></div>
        <div className="w-16 h-16 bg-nord-2 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-nord-3 shadow-lg">
          <Lock className="w-8 h-8 text-nord-13" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Deep Analytics are Locked</h2>
        <p className="text-nord-4 text-lg max-w-2xl mx-auto mb-8">
          Want to know your exact weak points? Upgrade now to unlock advanced predictive analytics, grading insights, and custom improvement plans.
        </p>
      </div>

      <PricingCards />
    </div>
  );
}
