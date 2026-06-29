"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Camera, BookOpen, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from "framer-motion";

interface SolutionLog {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
}

export default function ActivityFeed({ logs }: { logs: SolutionLog[] }) {
  const [selectedLog, setSelectedLog] = useState<SolutionLog | null>(null);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 mt-16">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Activity Log
          </h2>
          <p className="text-lg text-nord-4">Your recent Snap & Solve and Survival Guide history.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.map((log) => (
          <div 
            key={log.id} 
            onClick={() => setSelectedLog(log)}
            className="group cursor-pointer p-6 rounded-3xl bg-nord-1 border border-nord-3 hover:bg-nord-2 hover:border-nord-14/50 transition-all duration-300 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${log.type === 'SNAP_AND_SOLVE' ? 'bg-nord-2/20 border-nord-2' : 'bg-nord-12/20 border-nord-2'}`}>
                {log.type === 'SNAP_AND_SOLVE' ? (
                  <Camera className="w-6 h-6 text-nord-4" />
                ) : (
                  <BookOpen className="w-6 h-6 text-nord-4" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {log.type === 'SNAP_AND_SOLVE' ? 'Snap & Solve' : 'Survival Guide'}
            </h3>
            <p className="text-nord-4 text-sm mb-4 line-clamp-2">
              {log.content.substring(0, 100)}...
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
              <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-nord-3 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-nord-3 flex items-center justify-between bg-nord-1">
                <div className="flex items-center gap-3">
                  {selectedLog.type === 'SNAP_AND_SOLVE' ? (
                    <Camera className="w-5 h-5 text-nord-4" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-nord-4" />
                  )}
                  <h3 className="font-bold text-white">
                    {selectedLog.type === 'SNAP_AND_SOLVE' ? 'Snap & Solve Result' : 'Survival Guide'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-lg hover:bg-nord-2 transition-colors"
                >
                  <X className="w-5 h-5 text-nord-4" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar prose prose-invert prose-indigo max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {selectedLog.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
