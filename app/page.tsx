'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import TestEnvironment from '@/components/TestEnvironment';
import { QuestionSet } from '@/lib/ai-engine';
import { getTestById, getUserInsights } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Zap, Flame, Trophy, User, Camera, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const [testData, setTestData] = useState<QuestionSet | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [insights, setInsights] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  
  const { data: session } = useSession();

  const handleTestGenerated = (data: QuestionSet, id: string) => {
    setTestData(data);
    setTestId(id);
  };

  const consumeInsight = () => {
    return true;
  };

  const handleReset = () => {
    setTestData(null);
    setTestId(null);
    window.history.replaceState(null, '', '/'); // Remove testId from URL
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('testId');
    if (id) {
      getTestById(id).then(data => {
        if (data) {
          setTestData(data as any);
          setTestId(id);
        }
      });
    }

    // Load xp, and streak

    // Fetch user insights from backend if logged in
    if (session?.user && (session.user as any).id) {
      getUserInsights((session.user as any).id).then(count => {
        setInsights(count);
      });
    }

    const storedStreak = localStorage.getItem('magic_streak');
    if (storedStreak !== null) {
      setStreak(parseInt(storedStreak, 10));
    } else {
      setStreak(1);
    }
  }, [session]);

  return (
    <main className="min-h-screen bg-nord-0 text-white overflow-hidden relative selection:bg-nord-14/30">
      {/* Solid Clean Background for Nord Theme */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-5"></div>

      {/* Centered Pill Navigation - Dashboard Style */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <div className="flex items-center gap-4 bg-nord-1/90 backdrop-blur-md border border-nord-2 px-6 py-3 rounded-2xl shadow-xl">
          <Link href="/analytics" className="text-sm font-medium text-nord-4 hover:text-white transition-colors">
            Analytics
          </Link>
          <div className="w-[1px] h-4 bg-nord-3"></div>
          <Link href="/snap-and-solve" className="text-sm font-medium text-nord-4 hover:text-white transition-colors">
            Snap & Solve
          </Link>
          <div className="w-[1px] h-4 bg-nord-3"></div>
          <Link href="/survival-guide" className="text-sm font-medium text-nord-4 hover:text-white transition-colors">
            Survival Guide
          </Link>

          {/* Gamification Dropdown/Group */}
          <div className="w-[1px] h-4 bg-nord-3"></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 cursor-pointer text-nord-12 hover:text-nord-13 transition-colors">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
            <Link href="/dashboard/upgrade" className="flex items-center gap-1.5 cursor-pointer text-nord-13 hover:text-yellow-300 transition-colors">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{insights}</span>
            </Link>
          </div>

          <div className="w-[1px] h-4 bg-nord-3"></div>
          {session ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => signOut()}>
              {session.user?.image ? (
                <img src={session.user.image} alt="User" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-nord-2 flex items-center justify-center">
                  <User className="w-3 h-3 text-nord-4" />
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin" className="text-sm font-medium text-nord-14 hover:text-white transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 relative z-10">
        <AnimatePresence mode="wait">
          {!testData && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-nord-1 border border-nord-2 mb-6">
                <Sparkles className="w-4 h-4 text-nord-14" />
                <span className="text-sm font-medium text-nord-4">Next-Gen AI Testing Engine</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-nord-6">
                Transform Documents into <br/>
                <span className="text-nord-8">
                  Interactive Knowledge
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-nord-4 font-normal">
                Upload your course materials, PDFs, or images, and our advanced neural engine will instantly synthesize a beautifully structured, interactive assessment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!testData ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
            >
              <FileUpload onTestGenerated={handleTestGenerated} onConsumeInsight={consumeInsight} />
            </motion.div>
          ) : (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TestEnvironment 
                testData={testData} 
                testId={testId!} 
                onReset={handleReset} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="w-full text-center py-8 text-sm text-zinc-600 mt-auto relative z-10">
        <p>© {new Date().getFullYear()} Aether Learning. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-nord-4 transition-colors">Privacy Policy</Link>
          <a href="mailto:support@aetherlearning.com" className="hover:text-nord-4 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  );
}
