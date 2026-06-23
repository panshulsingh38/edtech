'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Music, Volume2, VolumeX, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils'; // wait, no, I need to use inline cn

import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
function cnlocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FOCUS_TIME = 25 * 60; // 25 mins
const BREAK_TIME = 5 * 60; // 5 mins

const MUSIC_TRACKS = [
  { name: 'Lo-Fi Chill', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { name: 'Coffee Shop Ambience', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { name: 'Spaceship Drone', url: 'https://actions.google.com/sounds/v1/science_fiction/spaceship_interior.ogg' },
  { name: 'Heavy Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' }
];

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto-switch mode
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const cycleTrack = () => {
    const nextIdx = (currentTrackIdx + 1) % MUSIC_TRACKS.length;
    setCurrentTrackIdx(nextIdx);
  };

  // Ensure audio element reloads when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isMusicPlaying) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
    }
  }, [currentTrackIdx]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="bg-[#13131a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={cnlocal(
        "absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[60px] opacity-30 transition-colors duration-1000",
        mode === 'focus' ? "bg-indigo-500" : "bg-emerald-500"
      )} />

      {/* Lo-Fi Audio Player (Hidden, streams a generic royalty free lofi beat) */}
      <audio 
        ref={audioRef} 
        loop 
        src={MUSIC_TRACKS[currentTrackIdx].url} 
      />

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Mode Switcher */}
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 mb-6 w-full">
          <button
            onClick={() => switchMode('focus')}
            className={cnlocal(
              "flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'focus' ? "bg-indigo-500 text-white shadow-md" : "text-gray-400 hover:text-white"
            )}
          >
            <Brain className="w-3.5 h-3.5" /> Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={cnlocal(
              "flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'break' ? "bg-emerald-500 text-white shadow-md" : "text-gray-400 hover:text-white"
            )}
          >
            <Coffee className="w-3.5 h-3.5" /> Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          {/* Circular Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="4" 
            />
            <motion.circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke={mode === 'focus' ? "#6366f1" : "#10b981"} 
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: "289 289", strokeDashoffset: 289 }}
              animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          <div className="text-center">
            <div className="text-5xl font-extrabold tracking-tighter text-white tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className={cnlocal(
              "text-sm font-medium mt-1",
              mode === 'focus' ? "text-indigo-400" : "text-emerald-400"
            )}>
              {mode === 'focus' ? "Deep Work" : "Relax"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMusic}
              className={cnlocal(
                "w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all",
                isMusicPlaying ? "bg-pink-500/20 text-pink-400 border-pink-500/50" : "bg-white/5 text-gray-400 hover:text-white"
              )}
              title="Toggle Music"
            >
              {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleTimer}
              className={cnlocal(
                "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
                mode === 'focus' ? "bg-indigo-600 hover:bg-indigo-500" : "bg-emerald-600 hover:bg-emerald-500"
              )}
            >
              {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <button
              onClick={resetTimer}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Track Switcher */}
          <button 
            onClick={cycleTrack}
            className="text-xs text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 mt-2"
          >
            <Music className="w-3 h-3" />
            {MUSIC_TRACKS[currentTrackIdx].name}
          </button>
        </div>

      </div>
    </div>
  );
}
