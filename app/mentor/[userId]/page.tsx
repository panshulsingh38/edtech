import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Activity, BookOpen, Brain, Flame, Target } from 'lucide-react';
import Link from 'next/link';

export default async function MentorPortal({ params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { tests: true }
  });

  if (!user) return notFound();

  const totalTests = user.tests.length;
  const examDate = user.examDate ? new Date(user.examDate) : null;
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-black/95 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-electric-blue/10 rounded-full border border-electric-blue/20 mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mentor Portal</h1>
          <p className="text-xl text-zinc-400">Viewing progress for <span className="text-white font-semibold">{user.name || "Student"}</span></p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-glass-surface border border-glass-border backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24" />
            </div>
            <h3 className="text-zinc-400 font-medium mb-2">Tests Generated</h3>
            <p className="text-4xl font-bold text-white">{totalTests}</p>
          </div>

          <div className="p-6 rounded-3xl bg-glass-surface border border-glass-border backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame className="w-24 h-24 text-orange-500" />
            </div>
            <h3 className="text-zinc-400 font-medium mb-2">Current Streak</h3>
            <p className="text-4xl font-bold text-zinc-300">{user.streak} <span className="text-xl text-gray-500 font-normal">days</span></p>
          </div>

          <div className="p-6 rounded-3xl bg-glass-surface border border-glass-border backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-24 h-24 text-zinc-300" />
            </div>
            <h3 className="text-zinc-400 font-medium mb-2">Insights Remaining</h3>
            <p className="text-4xl font-bold text-zinc-300">{user.insights}</p>
          </div>

          <div className="p-6 rounded-3xl bg-glass-surface border border-glass-border backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24 text-emerald-500" />
            </div>
            <h3 className="text-zinc-400 font-medium mb-2">Target Exam</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {daysUntilExam !== null ? (
                <span>{daysUntilExam > 0 ? `${daysUntilExam} Days Left` : "Exam Passed!"}</span>
              ) : (
                <span className="text-gray-500 text-lg">Not Set</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-100 mb-4">Want to help {user.name || 'them'} succeed?</h2>
          <p className="text-zinc-400/70 mb-8 max-w-2xl mx-auto">
            Our AI tutor provides personalized feedback, identifies blindspots, and creates a tailored curriculum. Upgrade their account to unlock unlimited AI test generation and advanced analytics.
          </p>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-4 bg-electric-blue hover:bg-electric-blue text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1">
            Upgrade Account
          </Link>
        </div>
      </div>
    </div>
  );
}
