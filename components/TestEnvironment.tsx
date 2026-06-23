'use client';

import { useState } from 'react';
import { QuestionSet } from '@/lib/ai-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, DownloadCloud, Layers, ClipboardList, ChevronDown, Copy, Network, Swords } from 'lucide-react';
import ChatTutor from '@/components/ChatTutor';
import Flashcard from '@/components/Flashcard';
import PomodoroTimer from '@/components/PomodoroTimer';
import MindMap from '@/components/MindMap';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { useRouter } from 'next/navigation';
import { createLobby } from '@/app/actions';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TestEnvironmentProps {
  testData: QuestionSet;
  testId: string;
  onReset: () => void;
}

export default function TestEnvironment({ testData, testId, onReset }: TestEnvironmentProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [gradingResults, setGradingResults] = useState<Record<string, { score: number, feedback: string }>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [mode, setMode] = useState<'test' | 'flashcards' | 'mindmap'>('test');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState('');

  const exportToQuizlet = () => {
    // Quizlet uses Tab-separated values for importing: Term (tab) Definition
    const content = testData.questions
      .map(q => `${q.questionText}\t${q.correctAnswer}`)
      .join('\n');
    navigator.clipboard.writeText(content);
    setExportToast('Copied to clipboard for Quizlet!');
    setTimeout(() => setExportToast(''), 3000);
    setShowExportMenu(false);
  };

  const exportToNotion = () => {
    // Notion uses CSV or Markdown for importing. We'll use a simple Markdown table format.
    let content = '| Question | Answer |\n|---|---|\n';
    content += testData.questions
      .map(q => `| ${q.questionText.replace(/\|/g, '\\|')} | ${q.correctAnswer.replace(/\|/g, '\\|')} |`)
      .join('\n');
    navigator.clipboard.writeText(content);
    setExportToast('Copied to clipboard for Notion!');
    setTimeout(() => setExportToast(''), 3000);
    setShowExportMenu(false);
  };

  const handleOptionChange = (questionId: string, value: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let score = 0;
    testData.questions.forEach(q => {
      if (q.type === 'short_answer') {
        if (gradingResults[q.id] && gradingResults[q.id].score >= 7) {
          score += 1;
        }
      } else if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const shortAnswerQuestions = testData.questions.filter(q => q.type === 'short_answer');
    if (shortAnswerQuestions.length > 0) {
      setIsGrading(true);
      
      const results: Record<string, { score: number, feedback: string }> = {};
      
      await Promise.all(shortAnswerQuestions.map(async (q) => {
        const userAnswer = answers[q.id];
        if (!userAnswer) {
           results[q.id] = { score: 0, feedback: "You didn't provide an answer." };
           return;
        }
        
        try {
          const res = await fetch('/api/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionText: q.questionText,
              correctAnswer: q.correctAnswer,
              userAnswer: userAnswer
            })
          });
          if (res.ok) {
            results[q.id] = await res.json();
          } else {
            results[q.id] = { score: 0, feedback: "Failed to grade answer." };
          }
        } catch (e) {
          results[q.id] = { score: 0, feedback: "Error connecting to grading server." };
        }
      }));
      
      setGradingResults(results);
      setIsGrading(false);

      // Award XP after grading
      let finalScore = 0;
      testData.questions.forEach(q => {
        if (q.type === 'short_answer') {
          if (results[q.id] && results[q.id].score >= 7) finalScore += 1;
        } else if (answers[q.id] === q.correctAnswer) {
          finalScore += 1;
        }
      });
      if (finalScore > 0) {
        window.dispatchEvent(new CustomEvent('gain-xp', { detail: { amount: finalScore * 10 } }));
      }
    } else {
      // Award XP immediately for multiple choice
      let finalScore = 0;
      testData.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) finalScore += 1;
      });
      if (finalScore > 0) {
        window.dispatchEvent(new CustomEvent('gain-xp', { detail: { amount: finalScore * 10 } }));
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 print:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-white/10 gap-4">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {testData.testTitle}
        </h2>
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center bg-[#1a1a24] rounded-full p-1 mr-4 border border-white/10">
            <button
              onClick={() => setMode('test')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'test' ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Test
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'flashcards' ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
            <button
              onClick={() => setMode('mindmap')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'mindmap' ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              <Network className="w-4 h-4" />
              Mind Map
            </button>
          </div>
          <div className="relative print:hidden flex items-center gap-2">
            <button
              onClick={async () => {
                const lobbyId = await createLobby(testId);
                router.push(`/battle/${lobbyId}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 font-bold transition-all duration-200 shadow-lg shadow-orange-500/10 hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              Battle
            </button>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-medium transition-all duration-200"
            >
              <DownloadCloud className="w-4 h-4" />
              Export <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-1">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Save as PDF
                    </button>
                    <button 
                      onClick={exportToQuizlet}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy for Quizlet
                    </button>
                    <button 
                      onClick={exportToNotion}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy for Notion
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            New Test
          </button>
        </div>
      </div>

      {showResults && mode === 'test' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-[1px] rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          <div className="bg-[#13131a] rounded-[23px] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-indigo-500/20 blur-[60px]" />
            <h3 className="text-2xl font-bold text-gray-300 mb-4 relative z-10">Your Performance</h3>
            <div className="flex items-baseline justify-center gap-2 mb-8 relative z-10">
              <span className="text-7xl font-extrabold text-white">
                {calculateScore()}
              </span>
              <span className="text-3xl text-gray-500 font-medium">/ {testData.questions.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-6 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(calculateScore() / testData.questions.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {mode === 'flashcards' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {testData.questions.map((q, idx) => (
            <motion.div key={q.id} variants={itemVariants}>
              <Flashcard 
                id={q.id}
                question={q.questionText}
                answer={q.correctAnswer}
                explanation={q.explanation}
                index={idx}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {mode === 'mindmap' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex justify-center"
        >
          <MindMap testData={testData} />
        </motion.div>
      )}

      {mode === 'test' && (
        <form onSubmit={handleSubmit}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {testData.questions.map((q, index) => {
            const isCorrect = answers[q.id] === q.correctAnswer;
            const isAnswered = !!answers[q.id];

            return (
              <motion.div 
                key={q.id} 
                variants={itemVariants}
                className={cn(
                  "p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300",
                  showResults 
                    ? (isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20') 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                )}
              >
                <div className="flex items-start gap-6 mb-6">
                  <span className="flex items-center justify-center bg-indigo-500/20 text-indigo-300 font-bold rounded-xl w-12 h-12 shrink-0 text-xl border border-indigo-500/20">
                    {index + 1}
                  </span>
                  <p className="text-xl text-white font-medium pt-2 leading-relaxed">{q.questionText}</p>
                </div>

                {(q.type === 'mcq' || q.type === 'true_false') && q.options && (
                  <div className="space-y-3 ml-[4.5rem]">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id] === option;
                      const showCorrectHighlight = showResults && option === q.correctAnswer;
                      const showWrongHighlight = showResults && isSelected && !isCorrect;

                      let labelClass = "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ";
                      
                      if (showCorrectHighlight) {
                        labelClass += "bg-green-500/10 border-green-500/50 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                      } else if (showWrongHighlight) {
                        labelClass += "bg-red-500/10 border-red-500/50 text-red-200";
                      } else if (isSelected) {
                        labelClass += "bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]";
                      } else {
                        labelClass += "bg-white/5 border-transparent hover:bg-white/10 text-gray-300 hover:text-white";
                      }

                      return (
                        <label key={optIdx} className={labelClass}>
                          <div className="relative flex items-center justify-center mr-4">
                            <input 
                              type="radio" 
                              name={`question-${q.id}`} 
                              value={option}
                              checked={isSelected}
                              onChange={() => handleOptionChange(q.id, option)}
                              disabled={showResults}
                              className="peer sr-only"
                            />
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                              isSelected ? "border-indigo-400" : "border-gray-500 group-hover:border-gray-400"
                            )}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
                            </div>
                          </div>
                          <span className="text-lg">{option}</span>
                          
                          {showCorrectHighlight && <CheckCircle2 className="w-6 h-6 text-green-400 ml-auto" />}
                          {showWrongHighlight && <XCircle className="w-6 h-6 text-red-400 ml-auto" />}
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="ml-[4.5rem]">
                    <textarea
                      rows={3}
                      className={cn(
                        "block p-4 w-full text-lg text-white bg-white/5 rounded-xl border-2 focus:ring-0 transition-colors",
                        showResults 
                          ? "border-white/10 bg-white/5"
                          : "border-transparent focus:border-indigo-500 focus:bg-white/10"
                      )}
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleOptionChange(q.id, e.target.value)}
                      disabled={showResults}
                    />

                    {/* Grading Results for Short Answer */}
                    {showResults && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        {isGrading && !gradingResults[q.id] ? (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>AI is grading your answer...</span>
                          </div>
                        ) : gradingResults[q.id] ? (
                          <div className={cn(
                            "p-5 rounded-xl border",
                            gradingResults[q.id].score >= 8 ? 'bg-green-500/10 border-green-500/30' : 
                            gradingResults[q.id].score >= 5 ? 'bg-yellow-500/10 border-yellow-500/30' : 
                            'bg-red-500/10 border-red-500/30'
                          )}>
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                              <span className="font-bold uppercase tracking-wider text-sm text-gray-400">AI Grade</span>
                              <div className="flex items-baseline gap-1">
                                <span className={cn(
                                  "text-2xl font-bold",
                                  gradingResults[q.id].score >= 8 ? 'text-green-400' : 
                                  gradingResults[q.id].score >= 5 ? 'text-yellow-400' : 
                                  'text-red-400'
                                )}>
                                  {gradingResults[q.id].score}
                                </span>
                                <span className="text-gray-500">/ 10</span>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{gradingResults[q.id].feedback}</p>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                )}

                {showResults && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-[4.5rem] mt-6 overflow-hidden"
                  >
                    <div className={cn(
                      "p-6 rounded-xl border backdrop-blur-md",
                      isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                    )}>
                      {!isCorrect && (
                        <div className="mb-4 pb-4 border-b border-white/10">
                          <span className="text-sm font-bold tracking-wider uppercase text-gray-400 block mb-1">Correct Answer</span>
                          <span className="text-lg text-white font-medium">{q.correctAnswer}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-bold tracking-wider uppercase text-gray-400 block mb-2">AI Explanation</span>
                        <p className="text-gray-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {!showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky bottom-8 mt-12 bg-[#1a1a24]/80 backdrop-blur-xl p-6 border border-white/10 shadow-2xl rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 z-50 print:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-indigo-300 font-bold">{Object.keys(answers).length}</span>
              </div>
              <span className="text-gray-400 font-medium">
                of {testData.questions.length} answered
              </span>
            </div>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-lg px-10 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
            >
              Submit Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </form>
      )}
      <ChatTutor testId={testId} />
      
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <PomodoroTimer />
      </div>

      <AnimatePresence>
        {exportToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {exportToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
