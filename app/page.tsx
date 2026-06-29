'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { UploadCloud, FileText, ArrowRight, CheckCircle2, PlayCircle, BarChart3, Triangle } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#e5e9f0] text-[#2e3440] relative overflow-hidden font-sans">
      
      {/* Abstract Node Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 2px 2px, #81a1c1 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      {/* Top Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-2">
          <Triangle className="w-6 h-6 text-[#5e81ac]" />
          <span className="text-xl font-medium tracking-tight">AetherLearning</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4c566a]">
          <Link href="#" className="hover:text-[#2e3440] transition-colors">Platform</Link>
          <Link href="#" className="hover:text-[#2e3440] transition-colors">Solutions</Link>
          <Link href="/dashboard/upgrade" className="hover:text-[#2e3440] transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-[#2e3440] transition-colors">About</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm font-medium text-[#4c566a] hover:text-[#2e3440] transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="bg-[#4c566a] hover:bg-[#2e3440] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all">
            Start Free Path
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-24 flex flex-col items-center">
        
        {/* Distillation Pod Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-[500px] h-[350px] mb-8"
        >
          {/* Subtle glow behind the pod */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" />
          <Image 
            src="/distillation-pod.png" 
            alt="Distillation Pod" 
            fill 
            className="object-contain drop-shadow-2xl mix-blend-multiply"
            priority
          />
        </motion.div>

        {/* Hero Typography */}
        <div className="text-center max-w-4xl mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#2e3440] mb-4 font-[family-name:var(--font-playfair)] tracking-tight">
            COGNITIVE CLARITY | ARCHITECTURES OF INSIGHT
          </h1>
          <p className="text-[#4c566a] text-lg md:text-xl max-w-3xl mx-auto font-light">
            Distill any raw document into structured, interactive knowledge modules with our neural-syncretic engine.
          </p>
        </div>

        {/* Distillation Roadmap Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl bg-[#f0f4f8]/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="bg-[#e5e9f0]/90 border-b border-white/50 px-6 py-3 text-center text-sm font-semibold tracking-widest text-[#4c566a] uppercase">
            Your Distillation Roadmap
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/40 p-6 gap-6">
            
            {/* Synthesis Stream */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <UploadCloud className="w-4 h-4 text-[#88c0d0]" />
                SYNTHESIS STREAM
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm text-[#4c566a] border border-white/40">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#81a1c1]" />
                    Upload: File 1
                  </div>
                  <UploadCloud className="w-4 h-4 text-[#d8dee9]" />
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm text-[#4c566a] border border-white/40">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ebcb8b]" />
                    Document 2
                  </div>
                  <UploadCloud className="w-4 h-4 text-[#d8dee9]" />
                </div>
              </div>
            </div>

            {/* Path Builder */}
            <div className="space-y-4 md:px-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <ArrowRight className="w-4 h-4 text-[#88c0d0]" />
                PATH BUILDER
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#e5e9f0] border-2 border-[#88c0d0] flex items-center justify-center text-[#5e81ac] shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a] text-center leading-tight">Create<br/>Module</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Synthesize</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Optimize</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Finalize</span>
                </div>
              </div>
            </div>

            {/* Cognitive Progress */}
            <div className="space-y-4 md:pl-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <PlayCircle className="w-4 h-4 text-[#88c0d0]" />
                COGNITIVE PROGRESS
              </div>
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[#4c566a]">
                    <span>Progress</span>
                    <span>100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#d8dee9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ebcb8b] w-full rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[#4c566a]">
                    <span>Progress</span>
                    <span>50%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#d8dee9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5e81ac] w-1/2 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Floating Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 bg-[#2e3440] text-[#d8dee9] px-8 py-3 rounded-2xl flex items-center justify-center gap-8 shadow-2xl border border-[#434c5e]"
        >
          <span className="font-serif font-bold tracking-wider text-sm opacity-80 hover:opacity-100 transition-opacity">HARVARD</span>
          <span className="font-sans font-black tracking-widest text-lg opacity-80 hover:opacity-100 transition-opacity">MIT</span>
          <span className="font-sans font-medium text-sm flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
            <Triangle className="w-4 h-4 rotate-180" /> OpenAI
          </span>
        </motion.div>

      </div>
    </main>
  );
}
