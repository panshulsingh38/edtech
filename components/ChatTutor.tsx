'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, Code2 } from 'lucide-react';


import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
function cnlocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatTutorProps {
  testId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatTutor({ testId }: ChatTutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI Tutor. Stuck on a question? Ask me anything about the document!" }
  ]);
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('Standard');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranspiling, setIsTranspiling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          chatHistory: messages.slice(1), // exclude the welcome message from history
          newMessage: userMessage.content,
          persona,
          isTranspiling
        })
      });

      if (!res.ok) throw new Error('Failed to get response');
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble connecting to my brain. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cnlocal(
          "fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center z-50 print:hidden",
          isOpen ? "hidden" : "flex"
        )}
      >
        <MessageCircle className="w-8 h-8" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 right-8 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-[#1a1a24]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden print:hidden"
          >
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white font-semibold text-sm leading-tight">AI Tutor</h3>
                  <select 
                    value={persona} 
                    onChange={(e) => setPersona(e.target.value)}
                    className="bg-transparent text-xs text-indigo-400 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Standard" className="bg-slate-900">Standard Tutor</option>
                    <option value="Albert Einstein" className="bg-slate-900">Albert Einstein</option>
                    <option value="Socrates" className="bg-slate-900">Socrates</option>
                    <option value="Marie Curie" className="bg-slate-900">Marie Curie</option>
                    <option value="Gordon Ramsay (Strict)" className="bg-slate-900">Gordon Ramsay (Strict)</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cnlocal(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cnlocal(
                    "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap font-mono",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "bg-white/10 text-gray-200 border border-white/5 rounded-bl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-white/5 border border-white/5 rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsTranspiling(!isTranspiling)}
                  className={cnlocal(
                    "text-xs px-2 py-1 rounded border flex items-center gap-1 transition-colors",
                    isTranspiling 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                  )}
                >
                  <Code2 className="w-3 h-3" /> Transpile Code to Math Proof
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isTranspiling ? "Paste your JavaScript/Python code here..." : "Ask a question about the document..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-500 min-h-[46px] max-h-[150px] font-mono resize-y"
                  rows={isTranspiling ? 3 : 1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-[46px] w-[46px] flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
