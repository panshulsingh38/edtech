'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

const mockUsers: LeaderboardUser[] = [
  { rank: 1, name: "Alex Chen", xp: 12450, streak: 42 },
  { rank: 2, name: "Sarah Jenkins", xp: 9820, streak: 28 },
  { rank: 3, name: "Marcus Johnson", xp: 8400, streak: 15 },
  { rank: 4, name: "Elena Rodriguez", xp: 7100, streak: 12 },
  { rank: 5, name: "David Kim", xp: 5200, streak: 7 },
  { rank: 6, name: "You", xp: 0, streak: 1, isCurrentUser: true }, // Will be updated dynamically
  { rank: 7, name: "Priya Patel", xp: 450, streak: 2 },
  { rank: 8, name: "James Wilson", xp: 120, streak: 1 },
];

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const storedXp = parseInt(localStorage.getItem('magic_xp') || '0', 10);
    const storedStreak = parseInt(localStorage.getItem('magic_streak') || '1', 10);

    const updatedUsers = mockUsers.map(u => 
      u.isCurrentUser ? { ...u, xp: storedXp, streak: storedStreak } : u
    );

    // Sort by XP
    updatedUsers.sort((a, b) => b.xp - a.xp);
    // Update ranks
    updatedUsers.forEach((u, i) => u.rank = i + 1);

    setUsers(updatedUsers);
  }, []);

  return (
    <main className="min-h-screen bg-oled-black text-white p-6 relative selection:bg-electric-blue/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-600/10 hidden pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 hidden pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 pt-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-surface border border-glass-border backdrop-blur-md mb-6">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-200">Global Rankings</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            The Leaderboard
          </h1>
          <p className="text-zinc-400 text-lg">
            Compete with students worldwide. Gain XP by reviewing flashcards.
          </p>
        </div>

        <div className="bg-[#13131a]/80 backdrop-blur-xl border border-glass-border rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Student</div>
            <div className="col-span-2 text-center hidden sm:block">Streak</div>
            <div className="col-span-4 sm:col-span-2 text-right pr-4">XP</div>
          </div>

          <div className="flex flex-col">
            {users.map((user, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={user.name}
                className={cn(
                  "grid grid-cols-12 gap-4 p-6 items-center border-b border-white/5 transition-colors",
                  user.isCurrentUser ? "bg-electric-blue/10 border-electric-blue/20" : "hover:bg-glass-surface"
                )}
              >
                <div className="col-span-2 flex justify-center">
                  {user.rank === 1 ? (
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                  ) : user.rank === 2 ? (
                    <div className="w-10 h-10 rounded-full bg-gray-300/20 flex items-center justify-center border border-gray-300/50">
                      <span className="font-bold text-zinc-400">2</span>
                    </div>
                  ) : user.rank === 3 ? (
                    <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center border border-amber-600/50">
                      <span className="font-bold text-amber-500">3</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {user.rank}
                    </div>
                  )}
                </div>

                <div className="col-span-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue/30 to-purple-500/30 border border-glass-border flex flex-shrink-0 items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className={cn(
                    "font-medium truncate",
                    user.isCurrentUser ? "text-white font-bold" : "text-white"
                  )}>
                    {user.name} {user.isCurrentUser && "(You)"}
                  </span>
                </div>

                <div className="col-span-2 hidden sm:flex justify-center items-center gap-1.5">
                  <Flame className={cn("w-4 h-4", user.streak > 5 ? "text-orange-500" : "text-gray-600")} />
                  <span className="font-mono">{user.streak}</span>
                </div>

                <div className="col-span-4 sm:col-span-2 flex justify-end items-center gap-1.5 pr-4">
                  <span className="font-mono font-bold text-lg text-white">
                    {user.xp.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
