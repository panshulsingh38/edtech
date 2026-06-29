'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, FileText, ArrowRight, CheckCircle2, PlayCircle, BarChart3, Triangle } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 30, stiffness: 200 });

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <main className="min-h-screen bg-[#e5e9f0] text-[#2e3440] relative overflow-hidden font-sans" style={{ perspective: 1000 }}>
      
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
            Upload Your First Document Free
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-24 flex flex-col items-center">
        
        {/* Distillation Pod Image with 3D Tilt */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ rotateX: isMounted ? rotateX : 0, rotateY: isMounted ? rotateY : 0, transformStyle: "preserve-3d" }}
          transition={{ duration: 0.8 }}
          className="relative w-[500px] h-[350px] mb-8"
        >
          {/* Subtle glow behind the pod */}
          <motion.div 
            style={{ translateZ: -50 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" 
          />
          <motion.div style={{ translateZ: 50 }} className="w-full h-full relative">
            <Image 
              src="/distillation-pod.png" 
              alt="Distillation Pod" 
              fill 
              className="object-contain drop-shadow-2xl mix-blend-multiply"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Hero Typography */}
        <div className="text-center max-w-4xl mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#2e3440] mb-4 font-[family-name:var(--font-playfair)] tracking-tight">
            Turn Any Document Into An Interactive Study Guide
          </h1>
          <p className="text-[#4c566a] text-lg md:text-xl max-w-3xl mx-auto font-light">
            Upload your PDFs, notes, or lecture slides. Our AI instantly generates personalized flashcards, practice quizzes, and interactive modules to help you master the material.
          </p>
        </div>

        {/* Distillation Roadmap Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ rotateX: isMounted ? rotateX : 0, rotateY: isMounted ? rotateY : 0, transformStyle: "preserve-3d" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl bg-[#f0f4f8]/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="bg-[#e5e9f0]/90 border-b border-white/50 px-6 py-3 text-center text-sm font-semibold tracking-widest text-[#4c566a] uppercase">
            How It Works
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/40 p-6 gap-6">
            
            {/* Synthesis Stream */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <UploadCloud className="w-4 h-4 text-[#88c0d0]" />
                UPLOAD MATERIALS
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm text-[#4c566a] border border-white/40">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#81a1c1]" />
                    Biology_101_Syllabus.pdf
                  </div>
                  <UploadCloud className="w-4 h-4 text-[#d8dee9]" />
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm text-[#4c566a] border border-white/40">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ebcb8b]" />
                    Lecture_Notes.docx
                  </div>
                  <UploadCloud className="w-4 h-4 text-[#d8dee9]" />
                </div>
              </div>
            </div>

            {/* Path Builder */}
            <div className="space-y-4 md:px-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <ArrowRight className="w-4 h-4 text-[#88c0d0]" />
                AI GENERATION
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#e5e9f0] border-2 border-[#88c0d0] flex items-center justify-center text-[#5e81ac] shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a] text-center leading-tight">Extract<br/>Concepts</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Generate</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Build Quiz</span>
                </div>
                <div className="h-[1px] w-4 bg-[#d8dee9]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/50 border border-white flex items-center justify-center text-[#4c566a]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#4c566a]">Ready</span>
                </div>
              </div>
            </div>

            {/* Cognitive Progress */}
            <div className="space-y-4 md:pl-4">
              <div className="flex items-center gap-2 text-[#434c5e] font-medium text-sm">
                <PlayCircle className="w-4 h-4 text-[#88c0d0]" />
                TRACK MASTERY
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
          className="mt-16 flex flex-col items-center"
        >
          <span className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-widest">Trusted by students at</span>
          <div className="bg-[#2e3440] text-[#d8dee9] px-8 py-3 rounded-2xl flex items-center justify-center gap-8 shadow-2xl border border-[#434c5e]">
            <span className="font-serif font-bold tracking-wider text-sm opacity-80 hover:opacity-100 transition-opacity">HARVARD</span>
            <span className="font-sans font-black tracking-widest text-lg opacity-80 hover:opacity-100 transition-opacity">MIT</span>
            <span className="font-sans font-medium text-sm flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <Triangle className="w-4 h-4 rotate-180" /> OpenAI
            </span>
          </div>
        </motion.div>

      </div>

      {/* Feature Breakdown Section */}
      <section className="relative z-10 py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 font-[family-name:var(--font-playfair)]">What's Inside a Distilled Module?</h2>
            <p className="text-slate-500 text-lg">Every time you upload a document, our AI builds a complete study toolkit.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Concept Summaries</h3>
              <p className="text-slate-500 leading-relaxed">Dense textbook chapters are broken down into bite-sized, easy-to-read summaries that highlight the core concepts you actually need to know.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Smart Flashcards</h3>
              <p className="text-slate-500 leading-relaxed">Automatically generated spaced-repetition flashcards ensure you memorize key terms, dates, and definitions without spending hours making them.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Practice Quizzes</h3>
              <p className="text-slate-500 leading-relaxed">Test your knowledge with AI-generated multiple-choice questions that mimic real exam formats, complete with explanations for wrong answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 font-[family-name:var(--font-playfair)]">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-2">Is my data safe?</h4>
              <p className="text-slate-500">Yes. Your files are encrypted during transit, processed to generate your study module, and are never used to train public AI models.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-2">What file types work?</h4>
              <p className="text-slate-500">Currently, we support PDF, DOCX, TXT, and Markdown files up to 50MB in size. Support for audio and video lectures is coming soon.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-2">Is it really free?</h4>
              <p className="text-slate-500">You can upload your first few documents and generate complete modules completely free. We offer premium tiers for high-volume students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-slate-200 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Triangle className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-bold text-slate-800">AetherLearning</span>
            </div>
            <p className="mb-4 max-w-sm">Turn any document into an interactive study path in seconds. The smartest way to master new subjects.</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle2 className="w-4 h-4" />
              Your files are never stored. Processed and deleted immediately.
            </div>
          </div>
          
          <div>
            <h5 className="font-bold text-slate-800 mb-4">Product</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-indigo-600">Features</Link></li>
              <li><Link href="/dashboard/upgrade" className="hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Use Cases</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-slate-800 mb-4">Legal & Company</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-indigo-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Aether Learning. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-700">Upload Now ➔</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
