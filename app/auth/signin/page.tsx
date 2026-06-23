'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative selection:bg-indigo-500/30 flex items-center justify-center font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-[1px] rounded-[2rem] bg-gradient-to-b from-white/20 to-white/0 shadow-2xl shadow-indigo-500/10">
          <div className="bg-[#13131a]/90 backdrop-blur-3xl p-10 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
            
            {/* Logo */}
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            >
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </motion.div>

            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 tracking-tight">
              Welcome to MagicTest
            </h1>
            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
              Unlock your ultimate study arsenal. Sign in to generate AI study guides and join multiplayer lobbies.
            </p>

            <div className="w-full flex flex-col gap-4">
              <button
                onClick={() => { setIsLoading(true); signIn('google', { callbackUrl: '/' }); }}
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl font-bold transition-all duration-300 shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={() => { setIsLoading(true); signIn('github', { callbackUrl: '/' }); }}
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#24292F] hover:bg-[#1B1F24] text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-gray-500/20 hover:shadow-gray-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none overflow-hidden border border-white/5"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-white/10"></span>
              Secured by NextAuth
              <span className="w-8 h-[1px] bg-white/10"></span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
