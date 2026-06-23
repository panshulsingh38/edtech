'use client';

import { useState, useRef } from 'react';
import { QuestionSet } from '@/lib/ai-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, FileImage, Loader2, Sparkles } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('College Level');
  const [tone, setTone] = useState('Professional');
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
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF, TXT, PNG, or JPG.');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15MB.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Check and consume one insight. If false, they hit the paywall.
    if (!onConsumeInsight()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file as File);
      formData.append('difficulty', difficulty);
      formData.append('tone', tone);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during the upload.');
      }

      onTestGenerated(data.data, data.testId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        className={cn(
          "relative p-[2px] rounded-3xl overflow-hidden transition-all duration-500",
          isDragging ? "shadow-[0_0_40px_rgba(99,102,241,0.4)]" : "shadow-2xl shadow-black/50"
        )}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 animate-pulse" />
        
        <div className="relative bg-[#13131a]/90 backdrop-blur-xl rounded-[23px] p-8 md:p-12 border border-white/5">
          <form onSubmit={handleUpload} className="flex flex-col gap-8">
            
            <div 
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden cursor-pointer",
                isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
                file ? "border-solid border-indigo-500/50 bg-indigo-500/5" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,.txt,image/jpeg,image/png" 
                onChange={handleFileChange} 
              />
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-10 h-10 text-indigo-400" />
                    </div>
                    <p className="text-xl font-medium text-white mb-2">
                      Drop your document here
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                      or click to browse your files
                    </p>
                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">PDF</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">TXT</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">JPG/PNG</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="filled"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent to-indigo-500/10"
                  >
                    <div className="relative">
                      {file.type.includes('image') ? (
                        <FileImage className="w-24 h-24 text-indigo-400 mb-4" />
                      ) : (
                        <FileText className="w-24 h-24 text-indigo-400 mb-4" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-xl font-semibold text-white truncate max-w-[80%]">{file.name}</h3>
                    <p className="text-sm text-indigo-200 mt-2 font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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
                <label className="text-sm font-medium text-gray-400">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Elementary School</option>
                  <option>High School</option>
                  <option>College Level</option>
                  <option>Expert / PhD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Professional</option>
                  <option>Explain Like I'm 5</option>
                  <option>Humorous & Fun</option>
                  <option>Socratic (Ask Questions)</option>
                  <option>Pirate 🏴‍☠️</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!file || loading}
              className={cn(
                "w-full relative group overflow-hidden rounded-xl font-semibold text-lg py-4 transition-all duration-300",
                (!file || loading)
                  ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                  : "bg-white text-gray-900 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-white">Synthesizing Data...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Generate Magic Test
                  <Sparkles className="w-5 h-5 text-indigo-500 transition-transform group-hover:scale-125 group-hover:rotate-12" />
                </span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
