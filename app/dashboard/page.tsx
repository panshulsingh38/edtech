import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, BookOpen, FileText, Camera, Swords } from 'lucide-react';
import CheatSheetButton from './CheatSheetButton';
import ActivityFeed from '@/components/ActivityFeed';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This is a Server Component. It runs on the server and fetches directly from the DB.
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  let userProfile = null;
  let tests: any[] = [];
  let solutionLogs: any[] = [];

  if (session && session.user) {
    userProfile = await prisma.user.findUnique({
      // @ts-ignore
      where: { id: session.user.id }
    });

    tests = await prisma.test.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    solutionLogs = await prisma.solutionLog.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    // If not signed in, do not show a global list of all anonymous tests
    tests = [];
  }

  const examDate = userProfile?.examDate ? new Date(userProfile.examDate) : null;
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 pt-12 pb-24">
      {/* Gamification Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-nord-1/50 border border-nord-3 flex items-center justify-between">
          <div>
            <p className="text-nord-4 font-medium mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-nord-12">{userProfile?.streak || 0}</span>
              <span className="text-nord-12/50">days</span>
            </div>
          </div>
          <div className="text-5xl">🔥</div>
        </div>

        <div className="p-6 rounded-3xl bg-nord-1/50 border border-nord-3 flex items-center justify-between">
          <div>
            <p className="text-nord-4 font-medium mb-1">Target Exam</p>
            {daysUntilExam !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">{daysUntilExam > 0 ? daysUntilExam : 0}</span>
                <span className="text-emerald-400/50">days left</span>
              </div>
            ) : (
              <form action="/api/user/exam-date" method="POST" className="mt-2 flex items-center gap-2">
                <input type="date" name="examDate" className="bg-black/50 border border-nord-3 rounded-lg p-2 text-sm text-nord-5" required />
                <button type="submit" className="px-4 py-2 bg-nord-8 rounded-lg text-sm font-medium hover:bg-nord-8">Set</button>
              </form>
            )}
          </div>
          <div className="text-5xl">🎯</div>
        </div>

        <div className="p-6 rounded-3xl bg-nord-1/50 border border-nord-3 flex items-center justify-between">
          <div>
            <p className="text-nord-4 font-medium mb-1">Insights Remaining</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-nord-9">{userProfile?.insights || 0}</span>
            </div>
          </div>
          <div className="text-5xl">🧠</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Study Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/snap-and-solve" className="group p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-nord-8/30 hover:border-indigo-400 transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-nord-8/20 flex items-center justify-center">
              <Camera className="w-7 h-7 text-nord-8 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Snap & Solve</h3>
              <p className="text-nord-4/70 text-sm">Take a picture of a math or science problem and get an instant step-by-step solution.</p>
            </div>
          </Link>
          
          <Link href="/survival-guide" className="group p-6 rounded-3xl bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-500/30 hover:border-red-400 transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Survival Guide</h3>
              <p className="text-red-200/70 text-sm">Upload your syllabus and generate a 10-page crash course for tomorrow's exam.</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-nord-6 mb-2">
            My Tests
          </h1>
          <p className="text-lg text-nord-4">Review your past generated study materials.</p>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-3xl bg-nord-1/50 backdrop-blur-sm">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-2">
            {!session ? "Sign in to view your tests" : "No tests found"}
          </h3>
          <p className="text-nord-4 mb-8 max-w-sm mx-auto">
            {!session 
              ? "When you sign up, all your generated tests will be saved here."
              : "Upload a PDF document to generate your first Magic Test!"}
          </p>
          <Link 
            href="/"
            className="px-8 py-4 rounded-xl bg-nord-8 hover:bg-nord-8 text-white font-medium transition-all"
          >
            Create a Test
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div 
              key={test.id} 
              className="group p-6 rounded-3xl bg-nord-1/50 border border-nord-3 hover:bg-nord-2/50 hover:border-nord-8/50 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-nord-8/20 flex items-center justify-center border border-nord-8/30">
                  <FileText className="w-6 h-6 text-nord-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 flex-1">{test.title}</h3>
              <div className="flex items-center gap-4 text-sm text-nord-4 mb-4">
                <span>{test._count.questions} questions</span>
                <span>•</span>
                <span>{formatDistanceToNow(test.createdAt, { addSuffix: true })}</span>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto">
                <Link 
                  href={`/?testId=${test.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-nord-8 hover:bg-nord-8 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Take Test <ArrowRight className="w-4 h-4" />
                </Link>
                <CheatSheetButton testId={test.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {solutionLogs.length > 0 && (
        <ActivityFeed logs={solutionLogs} />
      )}
    </div>
  );
}
