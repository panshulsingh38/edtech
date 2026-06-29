'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SprintTimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  timeDelta: number; // to add or remove time externally
}

export default function SprintTimer({ initialTime, isActive, onTimeUp, timeDelta }: SprintTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [deltaAnimation, setDeltaAnimation] = useState<{ value: number, id: number } | null>(null);

  useEffect(() => {
    if (timeDelta !== 0) {
      setTimeLeft(prev => Math.max(0, prev + timeDelta));
      setDeltaAnimation({ value: timeDelta, id: Date.now() });
    }
  }, [timeDelta]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      onTimeUp();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isDanger = timeLeft <= 15;

  return (
    <div className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl border-2 shadow-lg transition-colors duration-300 ${isDanger ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-indigo-900/50 border-electric-blue/30 text-white'}`}>
      <Timer className={`w-5 h-5 ${isDanger ? 'animate-pulse' : ''}`} />
      <span className="w-16 text-center">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
      
      <AnimatePresence>
        {deltaAnimation && (
          <motion.div
            key={deltaAnimation.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className={`absolute -top-4 right-0 font-bold ${deltaAnimation.value > 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {deltaAnimation.value > 0 ? '+' : ''}{deltaAnimation.value}s
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
