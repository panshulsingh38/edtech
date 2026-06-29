'use client';

import { useState } from 'react';
import { FileText, Loader2, DownloadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function CheatSheetButton({ testId }: { testId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const generateCheatSheet = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      const res = await fetch('/api/cheat-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId })
      });
      const data = await res.json();
      if (data.markdown) {
        setMarkdown(data.markdown);
        setIsOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CheatSheet-${testId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <button 
        onClick={generateCheatSheet}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-electric-blue/10 hover:bg-electric-blue/20 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {isLoading ? "Generating..." : "Generate Cheat Sheet"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-glass-border w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-glass-border flex justify-between items-center bg-glass-surface">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white" />
                  AI Cheat Sheet
                </h2>
                <div className="flex gap-2">
                  <button onClick={handleDownload} className="px-3 py-1.5 bg-electric-blue hover:bg-electric-blue rounded-lg text-sm text-white flex items-center gap-2 transition-colors">
                    <DownloadCloud className="w-4 h-4" /> Download .md
                  </button>
                  <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto prose prose-invert prose-indigo max-w-none flex-1 bg-[#13131a]">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
