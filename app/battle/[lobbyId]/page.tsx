'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLobbyState, joinLobby, startLobby, updatePlayerProgress } from '@/app/actions';
import { motion } from 'framer-motion';
import { Swords, Users, Play, Crown, Trophy, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BattlePage() {
  const { lobbyId } = useParams() as { lobbyId: string };
  const [lobby, setLobby] = useState<any>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Poll for lobby state
  useEffect(() => {
    const fetchLobby = async () => {
      const state = await getLobbyState(lobbyId);
      setLobby(state);
    };
    fetchLobby();
    const interval = setInterval(fetchLobby, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [lobbyId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const pId = await joinLobby(lobbyId, playerName);
    setPlayerId(pId);
  };

  const handleStart = async () => {
    await startLobby(lobbyId);
  };

  const handleAnswer = async (option: string) => {
    if (!lobby || !playerId) return;
    setSelectedOption(option);
    
    const question = lobby.test.questions[currentQuestionIdx];
    let newScore = score;
    if (option === question.correctAnswer) {
      newScore += 100;
      setScore(newScore);
    }

    const progress = Math.round(((currentQuestionIdx + 1) / lobby.test.questions.length) * 100);
    await updatePlayerProgress(playerId, progress, newScore);

    setTimeout(() => {
      if (currentQuestionIdx < lobby.test.questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        setSelectedOption(null);
      } else {
        // Finished
        setCurrentQuestionIdx(lobby.test.questions.length);
      }
    }, 1000);
  };

  if (!lobby) return <div className="min-h-screen bg-nord-0 flex items-center justify-center text-white">Loading Lobby...</div>;

  const me = lobby.players.find((p: any) => p.id === playerId);
  const isFinished = currentQuestionIdx >= lobby.test.questions.length;
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-nord-0 text-white p-6 pt-24 font-sans selection:bg-nord-14/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/20">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Quiz Battle
          </h1>
        </div>

        {!playerId && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-nord-1 p-8 rounded-3xl border border-nord-3 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Join Lobby</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter your nickname..." 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-nord-0 border border-nord-3 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nord-14 transition-colors"
                maxLength={15}
              />
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-nord-14 hover:from-nord-14 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25">
                Enter Arena
              </button>
            </form>
          </motion.div>
        )}

        {playerId && lobby.status === 'waiting' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-nord-1 p-8 rounded-3xl border border-nord-3 shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Waiting for players...</h2>
            <p className="text-nord-4 mb-8">Share this URL to invite friends</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {lobby.players.map((p: any) => (
                <div key={p.id} className="bg-nord-1 border border-nord-3 rounded-xl p-4 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-nord-8/20 text-white flex items-center justify-center font-bold text-xl">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{p.name}</span>
                </div>
              ))}
            </div>

            <button onClick={handleStart} className="bg-nord-14 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg flex items-center gap-2 mx-auto">
              <Play className="w-5 h-5 fill-current" /> Start Battle
            </button>
          </motion.div>
        )}

        {playerId && lobby.status === 'playing' && !isFinished && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div key={currentQuestionIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-nord-1 p-8 rounded-3xl border border-nord-3">
                <div className="text-white font-bold tracking-widest text-sm uppercase mb-4">Question {currentQuestionIdx + 1} of {lobby.test.questions.length}</div>
                <h3 className="text-2xl font-medium mb-8 leading-relaxed">
                  {lobby.test.questions[currentQuestionIdx].questionText}
                </h3>
                
                <div className="space-y-3">
                  {lobby.test.questions[currentQuestionIdx].options ? (
                    JSON.parse(lobby.test.questions[currentQuestionIdx].options).map((opt: string, i: number) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt === lobby.test.questions[currentQuestionIdx].correctAnswer;
                      const showResult = selectedOption !== null;

                      let btnClass = "bg-nord-1 border-nord-3 text-nord-4 hover:bg-nord-2";
                      if (showResult) {
                        if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                        else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                      }

                      return (
                        <button
                          key={i}
                          disabled={showResult}
                          onClick={() => handleAnswer(opt)}
                          className={cn("w-full text-left p-4 rounded-xl border transition-all duration-300", btnClass)}
                        >
                          {opt}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-nord-4 italic">Short answer questions are not supported in multiplayer mode yet. Please wait.</div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-white" /> Leaderboard</h3>
              {sortedPlayers.map((p: any, idx: number) => (
                <div key={p.id} className={cn("bg-nord-1 p-4 rounded-xl border flex flex-col gap-2 transition-all", p.id === playerId ? "border-nord-14 shadow-lg" : "border-nord-3")}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2">
                      {idx === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      {p.name}
                    </span>
                    <span className="text-white font-bold">{p.score} pts</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-nord-14 transition-all duration-500" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {playerId && isFinished && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-nord-1 p-12 rounded-3xl border border-nord-3 shadow-2xl text-center max-w-2xl mx-auto">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2 text-white">Battle Finished!</h2>
            <p className="text-nord-4 mb-10">Here are the final standings:</p>
            
            <div className="space-y-4">
              {sortedPlayers.map((p: any, idx: number) => (
                <div key={p.id} className={cn("p-6 rounded-2xl border flex justify-between items-center text-xl", idx === 0 ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" : "bg-nord-1 border-nord-3 text-nord-4")}>
                  <div className="flex items-center gap-4">
                    <span className="font-bold opacity-50">#{idx + 1}</span>
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <span className="font-bold">{p.score} pts</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
