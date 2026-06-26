'use client';

import { useState, useRef } from 'react';
import { QuestionSet } from '@/lib/ai-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, FileImage, Loader2, Sparkles, Layers } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onTestGenerated: (testData: QuestionSet, testId: string) => void;
  onConsumeInsight: () => boolean;
}

export default function FileUpload({ onTestGenerated, onConsumeInsight }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('College Level');
  const [tone, setTone] = useState('Professional');
  const [isSynthesisMode, setIsSynthesisMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(Array.from(e.target.files));
    }
  };

  const handleFileSelection = (selectedFiles: File[]) => {
    const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    const validFiles = selectedFiles.filter(f => validTypes.includes(f.type));
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files had invalid types. Please upload PDF, TXT, PNG, or JPG.');
      return;
    }
    
    const tooLarge = validFiles.some(f => f.size > 15 * 1024 * 1024);
    if (tooLarge) {
      setError('One or more files are too large. Maximum size is 15MB per file.');
      return;
    }
    
    if (validFiles.length > 1 || files.length > 0) setIsSynthesisMode(true);
    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    // Check and consume one insight. If false, they hit the paywall.
    if (!onConsumeInsight()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('difficulty', difficulty);
      formData.append('tone', tone);
      if (isSynthesisMode) formData.append('isSynthesis', 'true');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        throw new Error(data?.error || `Server returned ${response.status}. This usually means Vercel timed out or you hit a limit.`);
      }

      onTestGenerated(data.data, data.testId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        className={cn(
          "relative p-[2px] rounded-3xl overflow-hidden transition-all duration-500",
          isDragging ? "shadow-[0_0_40px_rgba(99,102,241,0.4)]" : "shadow-2xl shadow-black/50"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 animate-pulse" />
        
        <div className="relative bg-[#13131a]/90 backdrop-blur-xl rounded-[23px] p-8 md:p-12 border border-white/5">
          <form onSubmit={handleUpload} className="flex flex-col gap-8">
            
            <div 
              className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[18rem] rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden cursor-pointer",
                isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
                files.length > 0 ? "border-solid border-indigo-500/50 bg-indigo-500/5 cursor-default" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,.txt,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange} 
              />
              
              <AnimatePresence mode="wait">
                {files.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center cursor-pointer p-6"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                      <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Files for Analysis</h3>
                    <p className="text-gray-400 mb-6 max-w-sm mx-auto">Drag & drop PDFs, text files, or images here. Upload multiple files for a Cross-Document Synthesis Matrix.</p>
                    
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors text-white font-medium">
                      Browse Files
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full text-left p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" /> 
                        {isSynthesisMode ? 'Cross-Document Synthesis' : 'Selected File'}
                      </h3>
                      <button 
                        type="button"
                        onClick={() => { setFiles([]); setIsSynthesisMode(false); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
                          {f.type.startsWith('image/') ? (
                            <FileImage className="w-8 h-8 text-indigo-400 shrink-0" />
                          ) : (
                            <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">{f.name}</p>
                            <p className="text-sm text-gray-500">{(f.size / (1024 * 1024)).toFixed(2)} MB • {f.type.split('/')[1]?.toUpperCase()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-3 px-4 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                      >
                        + Add Another File
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Target Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option className="bg-gray-900">High School</option>
                  <option className="bg-gray-900">College Level</option>
                  <option className="bg-gray-900">Post-Grad / PhD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Instructor Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option className="bg-gray-900">Professional</option>
                  <option className="bg-gray-900">Strict & Rigorous</option>
                  <option className="bg-gray-900">Friendly & Encouraging</option>
                  <option className="bg-gray-900">Socratic Method</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document{files.length > 1 ? 's' : ''}...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> {isSynthesisMode ? 'Generate Synthesis Matrix' : 'Generate Magic Test'}</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
