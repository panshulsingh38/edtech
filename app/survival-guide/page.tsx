"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, BookOpen, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";

export default function SurvivalGuide() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { completion: guide, isLoading: loading, complete, error } = useCompletion({
    api: '/api/survival-guide'
  });

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    await complete('', { body: formData as any });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
              <BookOpen className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                Night-Before Survival Guide
              </h1>
              <p className="text-zinc-400">Upload your textbook or syllabus and get a 10-page crash course.</p>
            </div>
          </div>
          <button onClick={() => router.push("/")} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 transition-colors">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          {/* Upload Section */}
          <div className="flex flex-col gap-6">
            <div 
              className="border-2 border-dashed border-zinc-700 hover:border-orange-500/50 bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="application/pdf" 
                className="hidden" 
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                    <FileText className="w-10 h-10 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 line-clamp-1 break-all px-4">{file.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">Upload PDF</h3>
                  <p className="text-sm text-zinc-500">
                    Upload your textbook, notes, or syllabus (PDF format only).
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Reading 500 Pages...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Generate Guide (5 Insights)
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{error.message}</p>
              </div>
            )}
          </div>

          {/* Guide Section */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 lg:p-10 min-h-[500px]">
            <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Your Survival Guide
            </h3>
            
            {!guide && loading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
                <p className="animate-pulse">Reading document & writing guide...</p>
              </div>
            ) : guide ? (
              <div className="text-zinc-300 leading-relaxed space-y-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-orange-400 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-zinc-800 [&>h2]:pb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-2 [&>strong]:text-orange-100 [&>code]:bg-zinc-800 [&>code]:text-orange-300 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>pre]:bg-zinc-950 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:mb-4 [&>pre>code]:bg-transparent [&>pre>code]:text-zinc-300 [&>pre>code]:p-0">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{guide}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-600">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-zinc-500" />
                </div>
                <p>Upload a PDF textbook and let the AI do the heavy lifting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
