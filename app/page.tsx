'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import TestEnvironment from '@/components/TestEnvironment';
import { QuestionSet } from '@/lib/ai-engine';
import { getTestById } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Diamond, Zap, Flame, Trophy, User, Camera, BookOpen } from 'lucide-react';
import Link from 'next/link';
import PaywallModal from '@/components/PaywallModal';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const [testData, setTestData] = useState<QuestionSet | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [insights, setInsights] = useState<number | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  
  const { data: session } = useSession();

  const handleTestGenerated = (data: QuestionSet, id: string) => {
    setTestData(data);
    setTestId(id);
  };

  const consumeInsight = () => {
    // Admin override
    // @ts-ignore - custom property
    if (session?.user?.role === 'ADMIN') return true;

    if (insights === null) {
      alert("Still loading your profile... Please try again in a few seconds.");
      return false;
    }
    if (insights < 3) {
      setIsPaywallOpen(true);
      return false;
    }
    const newCount = insights - 3;
    setInsights(newCount);
    
    // Only update localStorage if not logged in
    if (!session) {
      localStorage.setItem('magic_insights', newCount.toString());
    }
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

    // Load insights, xp, and streak
    if (session?.user) {
      // @ts-ignore
      setInsights(session.user.insights);
    } else {
      const storedInsights = localStorage.getItem('magic_insights');
      if (storedInsights !== null) {
        setInsights(Math.min(parseInt(storedInsights, 10), 10));
      } else {
        setInsights(10);
      }
    }

    const storedXp = localStorage.getItem('magic_xp');
    if (storedXp !== null) setXp(parseInt(storedXp, 10));

    const storedStreak = localStorage.getItem('magic_streak');
    if (storedStreak !== null) {
      setStreak(parseInt(storedStreak, 10));
    } else {
      setStreak(1); // default to 1 day streak for new users
    }

    // Listen for XP gain events from Flashcards
    const handleGainXp = (e: any) => {
      const amount = e.detail?.amount || 10;
      setXp(prev => {
        const newXp = prev + amount;
        localStorage.setItem('magic_xp', newXp.toString());
        return newXp;
      });
    };

    window.addEventListener('gain-xp', handleGainXp);
    return () => window.removeEventListener('gain-xp', handleGainXp);
  }, [session]);

  return (
    <main className="min-h-screen bg-nord-0 text-white overflow-hidden relative selection:bg-nord-8/30">
      {/* Solid Clean Background for Nord Theme */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-5"></div>

      {/* Top Navigation */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex items-center gap-4 flex-wrap justify-end">
        
        {/* Gamification Stats */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/leaderboard" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md cursor-pointer hover:bg-nord-2/50 transition-colors">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-white">Rank</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-white">{streak}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-white">{xp} XP</span>
          </div>
          <div 
            onClick={() => setIsPaywallOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md cursor-pointer hover:bg-nord-2/50 hover:border-nord-15/50 transition-all group"
            title="Refill Insights"
          >
            <Diamond className="w-4 h-4 text-nord-15 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-lg drop-shadow-md">
              {/* @ts-ignore */}
              {session?.user?.role === 'ADMIN' ? '∞' : insights !== null ? insights : '...'}
            </span>
            <div className="ml-1 w-5 h-5 rounded-full bg-nord-15/20 flex items-center justify-center text-nord-15 group-hover:bg-nord-15 group-hover:text-white transition-colors">
              <span className="text-sm font-bold leading-none mb-0.5">+</span>
            </div>
          </div>

          {/* @ts-ignore */}
          {session?.user?.role === 'ADMIN' && (
            <button 
              onClick={() => {
                setInsights(999);
                localStorage.setItem('magic_insights', '999');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md cursor-pointer hover:bg-nord-2/50 transition-colors"
              title="Admin Backdoor: Click to refill!"
            >
              <Diamond className="w-4 h-4 text-nord-15" />
              <span className="text-sm font-bold text-white">Refill</span>
            </button>
          )}

          {session ? (
            <div className="flex items-center gap-3 bg-nord-1/50 border border-nord-3 px-2 py-1.5 rounded-full pr-4">
              {session.user?.image ? (
                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-nord-8/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-nord-8" />
                </div>
              )}
              <span className="text-sm font-medium">{session.user?.name?.split(' ')[0]}</span>
              <button onClick={() => signOut()} className="ml-2 text-xs text-red-400 hover:text-red-300 font-medium">Sign Out</button>
            </div>
          ) : (
            <Link href="/auth/signin" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg">
              Sign In
            </Link>
          )}
        </div>


        <Link 
          href="/analytics" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nord-1/50 hover:bg-nord-2/50 border border-nord-3 backdrop-blur-md text-white font-medium transition-all duration-200"
        >
          <BarChart3 className="w-4 h-4 text-nord-8" />
          <span className="hidden sm:inline">Analytics</span>
        </Link>
        <Link 
          href="/snap-and-solve" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nord-9/10 hover:bg-nord-9/20 border border-nord-9/30 backdrop-blur-md text-nord-4 font-medium transition-all duration-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        >
          <Camera className="w-4 h-4 text-nord-9" />
          <span className="hidden sm:inline">Snap & Solve</span>
        </Link>
        <Link 
          href="/survival-guide" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nord-12/10 hover:bg-nord-12/20 border border-nord-12/30 backdrop-blur-md text-nord-4 font-medium transition-all duration-200 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
        >
          <BookOpen className="w-4 h-4 text-nord-12" />
          <span className="hidden sm:inline">Survival Guide</span>
        </Link>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nord-1/50 border border-nord-3 backdrop-blur-md mb-6">
                <Sparkles className="w-4 h-4 text-nord-8" />
                <span className="text-sm font-medium text-nord-4">Next-Gen AI Testing Engine</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Transform Documents into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-nord-7 via-nord-8 to-nord-9">
                  Interactive Knowledge
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-nord-4 font-light">
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
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <a href="mailto:support@aetherlearning.com" className="hover:text-zinc-400 transition-colors">Contact</a>
        </div>
      </footer>

      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </main>
  );
}
