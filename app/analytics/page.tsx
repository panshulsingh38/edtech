import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, Activity, CalendarDays, Flame } from 'lucide-react';

export default async function AnalyticsPage() {
  const reviews = await prisma.flashcardReview.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalReviews = reviews.length;
  const hardCount = reviews.filter(r => r.status === 'Hard').length;
  const goodCount = reviews.filter(r => r.status === 'Good').length;
  const easyCount = reviews.filter(r => r.status === 'Easy').length;

  // Simple percentages for the progress bar
  const hardPercent = totalReviews === 0 ? 0 : Math.round((hardCount / totalReviews) * 100);
  const goodPercent = totalReviews === 0 ? 0 : Math.round((goodCount / totalReviews) * 100);
  const easyPercent = totalReviews === 0 ? 0 : Math.round((easyCount / totalReviews) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 md:p-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-4 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Brain Analytics
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Track your memory retention and spaced repetition progress.</p>
          </div>
          <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#13131a] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <Activity className="w-8 h-8 text-indigo-400 mb-4" />
            <p className="text-gray-400 font-medium mb-1">Total Flashcard Reviews</p>
            <p className="text-4xl font-bold text-white">{totalReviews}</p>
          </div>
          
          <div className="bg-[#13131a] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <Flame className="w-8 h-8 text-orange-400 mb-4" />
            <p className="text-gray-400 font-medium mb-1">Current Study Streak</p>
            <p className="text-4xl font-bold text-white">4 Days</p>
          </div>

          <div className="bg-[#13131a] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <CalendarDays className="w-8 h-8 text-green-400 mb-4" />
            <p className="text-gray-400 font-medium mb-1">Cards Due Tomorrow</p>
            <p className="text-4xl font-bold text-white">{hardCount + Math.floor(goodCount / 2)}</p>
          </div>
        </div>

        {/* Memory Retention Breakdown */}
        <div className="bg-[#13131a] border border-white/5 p-8 md:p-12 rounded-3xl">
          <h2 className="text-2xl font-bold mb-8">Memory Retention Breakdown</h2>
          
          {totalReviews === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
              No review data yet. Take a test in Flashcard Mode and rate the cards!
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stacked Bar Chart */}
              <div className="h-12 w-full rounded-full overflow-hidden flex shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div style={{ width: `${easyPercent}%` }} className="h-full bg-blue-500 hover:opacity-80 transition-opacity" title="Easy" />
                <div style={{ width: `${goodPercent}%` }} className="h-full bg-green-500 hover:opacity-80 transition-opacity" title="Good" />
                <div style={{ width: `${hardPercent}%` }} className="h-full bg-red-500 hover:opacity-80 transition-opacity" title="Hard" />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col border-l-4 border-blue-500 pl-4 py-1">
                  <span className="text-gray-400 font-medium text-sm">Easy (Mastered)</span>
                  <span className="text-2xl font-bold text-white">{easyPercent}%</span>
                  <span className="text-xs text-gray-500 mt-1">{easyCount} cards</span>
                </div>
                <div className="flex flex-col border-l-4 border-green-500 pl-4 py-1">
                  <span className="text-gray-400 font-medium text-sm">Good (Learning)</span>
                  <span className="text-2xl font-bold text-white">{goodPercent}%</span>
                  <span className="text-xs text-gray-500 mt-1">{goodCount} cards</span>
                </div>
                <div className="flex flex-col border-l-4 border-red-500 pl-4 py-1">
                  <span className="text-gray-400 font-medium text-sm">Hard (Struggling)</span>
                  <span className="text-2xl font-bold text-white">{hardPercent}%</span>
                  <span className="text-xs text-gray-500 mt-1">{hardCount} cards</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
