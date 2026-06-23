'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RefreshCw, Volume2, Mic, MicOff } from 'lucide-react';

import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
function cnlocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FlashcardProps {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  index: number;
}

export default function Flashcard({ id, question, answer, explanation, index }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Hard' | 'Good' | 'Easy' | null>(null);
  
  // Voice Tutor State
  const [isListening, setIsListening] = useState(false);
  const [spokenAnswer, setSpokenAnswer] = useState('');

  const speakText = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('');
      setSpokenAnswer(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-flip if they stopped speaking
      setTimeout(() => setIsFlipped(true), 1500);
    };

    recognition.start();
  };

  const handleReview = async (e: React.MouseEvent, status: 'Hard' | 'Good' | 'Easy') => {
    e.stopPropagation(); // Don't flip the card
    setReviewStatus(status);

    // Gamification: Award XP
    const xpAmount = status === 'Hard' ? 5 : 10;
    window.dispatchEvent(new CustomEvent('gain-xp', { detail: { amount: xpAmount } }));

    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, status })
      });
    } catch (err) {
      console.error("Failed to save review", err);
    }
  };

  return (
    <div className="w-full aspect-[4/3] md:aspect-[3/2] perspective-1000 relative">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div 
          className={cnlocal(
            "absolute inset-0 backface-hidden w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center",
            "bg-gradient-to-br from-[#1a1a24] to-[#13131a] border border-white/10 shadow-xl hover:border-indigo-500/50 transition-colors"
          )}
        >
          <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-bold border border-white/10">
            {index + 1}
          </div>
          
          <button 
            onClick={(e) => speakText(e, question)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center justify-center text-gray-400 border border-white/10 transition-colors"
            title="Read Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <p className="text-2xl md:text-3xl font-medium text-white px-4 leading-relaxed mb-10">
            {question}
          </p>

          {spokenAnswer && (
            <div className="absolute bottom-24 w-full px-8 text-indigo-300 text-lg font-medium italic">
              "{spokenAnswer}"
            </div>
          )}

          <div className="absolute bottom-6 flex w-full justify-between items-center px-8">
            <button
              onClick={toggleListening}
              className={cnlocal(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                isListening 
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-sm font-medium">{isListening ? 'Listening...' : 'Speak Answer'}</span>
            </button>
            
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium ml-auto">
              <RefreshCw className="w-4 h-4" />
              Click to reveal
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className={cnlocal(
            "absolute inset-0 backface-hidden w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center",
            "bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 shadow-2xl",
            "rotate-y-180"
          )}
        >
          <button 
            onClick={(e) => speakText(e, `${answer}. ${explanation || ''}`)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center justify-center text-gray-400 border border-white/10 transition-colors"
            title="Read Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <h4 className="text-sm font-bold tracking-widest uppercase text-indigo-400 mb-4">Correct Answer</h4>
          <p className="text-3xl md:text-4xl font-bold text-white mb-6">
            {answer}
          </p>
          {explanation && (
            <p className="text-lg text-indigo-200/80 leading-relaxed max-w-2xl mb-12">
              {explanation}
            </p>
          )}

          {/* SRS Buttons */}
          <div className="absolute bottom-6 w-full px-8 flex items-center justify-center gap-4">
            <button
              onClick={(e) => handleReview(e, 'Hard')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Hard' ? "bg-red-500/20 border-red-500 text-red-300" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              Hard (10m)
            </button>
            <button
              onClick={(e) => handleReview(e, 'Good')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Good' ? "bg-green-500/20 border-green-500 text-green-300" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              Good (1d)
            </button>
            <button
              onClick={(e) => handleReview(e, 'Easy')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Easy' ? "bg-blue-500/20 border-blue-500 text-blue-300" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              Easy (4d)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
