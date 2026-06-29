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
  imagePrompt?: string | null;
  index: number;
}

export default function Flashcard({ id, question, answer, explanation, imagePrompt, index }: FlashcardProps) {
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
            "absolute inset-0 backface-hidden w-full h-full rounded-3xl flex flex-col items-center justify-center text-center overflow-hidden",
            "border border-nord-3 shadow-xl hover:border-nord-8/50 transition-colors"
          )}
        >
          {/* Background Image & Overlay */}
          {imagePrompt ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full transition-transform duration-700 scale-100 hover:scale-110"
                style={{ backgroundImage: `url('https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=800&height=600&nologo=true')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/90 backdrop-blur-[2px]" />
            </>
          ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a24] to-[#13131a]" />
          )}

          {/* Content Container */}
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col items-center justify-center z-10">
            <div className="absolute top-4 left-4 md:top-6 md:left-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-nord-2/50 flex items-center justify-center text-nord-5 font-bold border border-white/20 text-sm z-20">
              {index + 1}
            </div>
            
            <button 
              onClick={(e) => speakText(e, question)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-nord-2/50 hover:bg-nord-8/40 hover:text-nord-8 flex items-center justify-center text-nord-5 border border-white/20 transition-colors z-20"
              title="Read Aloud"
            >
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <div className="w-full max-h-[180px] overflow-y-auto custom-scrollbar pr-2 flex items-center justify-center my-auto">
              <h3 className="text-xl md:text-3xl font-bold text-center text-white break-words drop-shadow-md">
                {question}
              </h3>
            </div>


          {spokenAnswer && (
            <div className="absolute bottom-16 w-full px-8 text-nord-8 text-sm font-medium italic truncate">
              "{spokenAnswer}"
            </div>
          )}

          <div className="absolute bottom-4 md:bottom-6 flex w-full justify-between items-center px-4 md:px-8">
            <button
              onClick={toggleListening}
              className={cnlocal(
                "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all duration-300",
                isListening 
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                  : "bg-nord-1/50 border-nord-3 text-nord-4 hover:text-white hover:bg-nord-2/50"
              )}
            >
              {isListening ? <MicOff className="w-3 h-3 md:w-4 md:h-4" /> : <Mic className="w-3 h-3 md:w-4 md:h-4" />}
              <span className="text-xs md:text-sm font-medium">{isListening ? 'Listening...' : 'Speak'}</span>
            </button>
            
            <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-medium ml-auto">
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
              Click to reveal
            </div>
          </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className={cnlocal(
            "absolute inset-0 backface-hidden w-full h-full rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center",
            "bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-nord-8/30 shadow-2xl",
            "rotate-y-180"
          )}
        >
          <button 
            onClick={(e) => speakText(e, `${answer}. ${explanation || ''}`)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-nord-1/50 hover:bg-nord-8/20 hover:text-nord-8 flex items-center justify-center text-nord-4 border border-nord-3 transition-colors z-10"
            title="Read Aloud"
          >
            <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto py-10 px-2 mt-4 mb-8 custom-scrollbar">
            <h4 className="text-xs font-bold tracking-widest uppercase text-nord-8 mb-3 shrink-0">Correct Answer</h4>
            <p className="text-xl md:text-2xl font-bold text-white mb-4">
              {answer}
            </p>
            {explanation && (
              <p className="text-sm md:text-base text-nord-4/80 leading-relaxed max-w-2xl">
                {explanation}
              </p>
            )}
          </div>

          {/* SRS Buttons */}
          <div className="absolute bottom-6 w-full px-8 flex items-center justify-center gap-4">
            <button
              onClick={(e) => handleReview(e, 'Hard')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Hard' ? "bg-red-500/20 border-red-500 text-red-300" : "bg-nord-1/50 border-nord-3 text-nord-4 hover:bg-nord-2/50 hover:text-white"
              )}
            >
              Hard (10m)
            </button>
            <button
              onClick={(e) => handleReview(e, 'Good')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Good' ? "bg-green-500/20 border-green-500 text-green-300" : "bg-nord-1/50 border-nord-3 text-nord-4 hover:bg-nord-2/50 hover:text-white"
              )}
            >
              Good (1d)
            </button>
            <button
              onClick={(e) => handleReview(e, 'Easy')}
              className={cnlocal(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                reviewStatus === 'Easy' ? "bg-blue-500/20 border-blue-500 text-blue-300" : "bg-nord-1/50 border-nord-3 text-nord-4 hover:bg-nord-2/50 hover:text-white"
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
