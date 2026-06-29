'use client';

import { useState, useEffect } from 'react';
import { QuestionSet } from '@/lib/ai-engine';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, DownloadCloud, Layers, ClipboardList, ChevronDown, Copy, Network, Swords, Timer, Brain, Lightbulb, Dna, Volume2, Square, Eye, Mic, MicOff, Pen, AlertTriangle } from 'lucide-react';
import Flashcard from '@/components/Flashcard';
import PomodoroTimer from '@/components/PomodoroTimer';
import MindMap from '@/components/MindMap';
import CartesianPlane from '@/components/CartesianPlane';
import PhysicsSliders from '@/components/PhysicsSliders';
import SprintTimer from '@/components/SprintTimer';
import Whiteboard from '@/components/Whiteboard';
import ChatTutor from '@/components/ChatTutor';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { useRouter } from 'next/navigation';
import { createLobby } from '@/app/actions';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [answers, setAnswers] = useState<Record<string, { value: string, confidence: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [gradingResults, setGradingResults] = useState<Record<string, { score: number, feedback: string }>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [mode, setMode] = useState<'test' | 'flashcards' | 'mindmap'>('test');
  const [showWhiteboard, setShowWhiteboard] = useState<Record<string, boolean>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState('');
  const [analogies, setAnalogies] = useState<Record<string, { loading: boolean, text: string, discipline: string }>>({});
  const [hints, setHints] = useState<Record<string, { loading: boolean, text: string }>>({});
  const [generatingVariation, setGeneratingVariation] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState(testData.questions);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  
  const [isSprintMode, setIsSprintMode] = useState(false);
  const [timeDelta, setTimeDelta] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  // Proctoring
  const [blurViolations, setBlurViolations] = useState(0);
  const [showBlurWarning, setShowBlurWarning] = useState(false);

  useEffect(() => {
    const handleBlur = () => {
      if (!showResults && mode === 'test') {
        setBlurViolations(prev => prev + 1);
        setShowBlurWarning(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [showResults, mode]);

  // Ghost Mode Timer
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('theme-high-contrast');
    } else {
      document.body.classList.remove('theme-high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'test' && !showResults) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, showResults]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { value, confidence: prev[questionId]?.confidence || 1.0 } 
    }));
  };

  const handleConfidenceChange = (questionId: string, confidence: number) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value: prev[questionId]?.value || '', confidence }
    }));
  };

  const getAnalogy = async (questionId: string, concept: string) => {
    setAnalogies(prev => ({ ...prev, [questionId]: { loading: true, text: '', discipline: 'Computer Science' } }));
    try {
      const res = await fetch('/api/analogy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, discipline: 'Computer Science' }) // hardcoded for MVP, could be dynamic
      });
      const data = await res.json();
      setAnalogies(prev => ({ ...prev, [questionId]: { loading: false, text: data.analogy, discipline: 'Computer Science' } }));
    } catch (e) {
      setAnalogies(prev => ({ ...prev, [questionId]: { loading: false, text: 'Failed to generate analogy.', discipline: 'Computer Science' } }));
    }
  };

  const getHint = async (questionId: string, questionText: string, correctAnswer: string) => {
    setHints(prev => ({ ...prev, [questionId]: { loading: true, text: '' } }));
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, correctAnswer })
      });
      const data = await res.json();
      setHints(prev => ({ ...prev, [questionId]: { loading: false, text: data.hint } }));
    } catch (e) {
      setHints(prev => ({ ...prev, [questionId]: { loading: false, text: 'Failed to generate hint.' } }));
    }
  };

  const generateVariation = async (failedQuestion: any) => {
    setGeneratingVariation(failedQuestion.id);
    try {
      const res = await fetch('/api/variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failedQuestion })
      });
      const data = await res.json();
      if (data.variation) {
        setLocalQuestions(prev => [...prev, data.variation]);
      }
    } catch (e) {
      console.error("Failed to generate variation", e);
    } finally {
      setGeneratingVariation(null);
    }
  };

  const playAudio = (text: string, id: string) => {
    if (!window.speechSynthesis) return;

    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Strip LaTeX markup roughly for speech
    let cleanText = text.replace(/\$/g, '').replace(/\\frac{(.*?)}{(.*?)}/g, "$1 over $2").replace(/\\/g, '');
    utterance.text = cleanText;

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    setPlayingAudioId(id);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = (id: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (recordingId === id) {
      setRecordingId(null);
      return; // Stop is handled implicitly as we just don't restart
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setRecordingId(id);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = answers[id]?.value || '';
      handleOptionChange(id, currentVal + (currentVal ? ' ' : '') + transcript);
    };

    recognition.onerror = () => {
      setRecordingId(null);
    };

    recognition.onend = () => {
      setRecordingId(null);
    };

    recognition.start();
  };

  const calculateScore = () => {
    let score = 0;
    localQuestions.forEach(q => {
      let isCorrect = false;
      if (q.type === 'short_answer') {
        if (gradingResults[q.id]?.score >= 7) isCorrect = true;
      } else {
        if (answers[q.id]?.value === q.correctAnswer) isCorrect = true;
      }

      if (isCorrect) {
        score++;
        if (isSprintMode && !showResults) setTimeDelta(prev => prev > 0 ? prev + 10 : 10);
      } else {
        if (isSprintMode && !showResults) setTimeDelta(prev => prev < 0 ? prev - 5 : -5);
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
        const userAnswer = answers[q.id]?.value;
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
        } else if (answers[q.id]?.value === q.correctAnswer) {
          finalScore += 1;
        }
      });
      if (finalScore > 0) {
        window.dispatchEvent(new CustomEvent('gain-xp', { detail: { amount: finalScore * 10 } }));
      }
    } else {
      calculateScore(); 
      let finalScore = calculateScore();
      if (finalScore > 0) {
        window.dispatchEvent(new CustomEvent('gain-xp', { detail: { amount: finalScore * 10 } }));
      }
    }

    // Submit results to server for Spaced Repetition tracking
    try {
      const resultsPayload = localQuestions.map(q => {
        let isCorrect = answers[q.id]?.value === q.correctAnswer;
        if (q.type === 'short_answer') {
           isCorrect = gradingResults[q.id]?.score >= 7;
        }
        
        return {
          questionId: q.id,
          isCorrect,
          confidenceScore: answers[q.id]?.confidence || 1.0
        };
      });

      fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: resultsPayload })
      }).catch(err => console.error("Failed to submit test results to background:", err));
    } catch (e) {
      console.error(e);
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
    <>
      {/* Proctoring Warning Modal */}
      {showBlurWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-zinc-9001" />
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Attention!</h2>
            <p className="text-zinc-400 mb-6">
              You have navigated away from the exam environment. This is violation #{blurViolations}. Continuing to tab out may result in disciplinary action or automatic failure.
            </p>
            <button
              onClick={() => setShowBlurWarning(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
            >
              I Understand, Return to Test
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto pb-20 print:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-glass-border gap-4">
        <div className="flex items-center gap-4">
          {!showResults && (
            <div className="flex items-center gap-4 mr-4">
              <button
                onClick={() => setIsHighContrast(!isHighContrast)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                  isHighContrast ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" : "bg-glass-surface text-zinc-400 border border-glass-border hover:text-white"
                )}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">High Contrast</span>
              </button>
              
              <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Sprint Mode</span>
              <button
                onClick={() => setIsSprintMode(!isSprintMode)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                  isSprintMode ? "bg-electric-blue" : "bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1",
                    isSprintMode ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
              </div>
            </div>
          )}
          {isSprintMode && !showResults && (
            <SprintTimer 
              initialTime={60} 
              isActive={!showResults && mode === 'test'} 
              onTimeUp={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} 
              timeDelta={timeDelta} 
            />
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {testData.testTitle}
          </h2>
          {mode === 'test' && (
            <div className="flex items-center gap-2 bg-electric-blue/20 text-white px-4 py-2 rounded-full border border-electric-blue/30 font-mono text-xl shadow-lg">
              <Timer className="w-5 h-5" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 print:hidden w-full md:w-auto">
          <div className="flex items-center bg-zinc-900 rounded-full p-1 mr-4 border border-glass-border">
            <button
              onClick={() => setMode('test')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'test' ? "bg-electric-blue text-white shadow-lg" : "text-zinc-400 hover:text-white"
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Test
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'flashcards' ? "bg-electric-blue text-white shadow-lg" : "text-zinc-400 hover:text-white"
              )}
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
            <button
              onClick={() => setMode('mindmap')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                mode === 'mindmap' ? "bg-electric-blue text-white shadow-lg" : "text-zinc-400 hover:text-white"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-9002/20 hover:bg-zinc-9002/30 border border-white/10 text-zinc-300 font-bold transition-all duration-200 shadow-lg shadow-nord-12/10 hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              Battle
            </button>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30 text-white font-medium transition-all duration-200"
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
                  className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-1">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-glass-surface rounded-lg transition-colors text-left"
                    >
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Save as PDF
                    </button>
                    <button 
                      onClick={exportToQuizlet}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-glass-surface rounded-lg transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy for Quizlet
                    </button>
                    <button 
                      onClick={exportToNotion}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-glass-surface rounded-lg transition-colors text-left"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-glass-surface hover:bg-white/[0.06] border border-glass-border text-white font-medium transition-all duration-200"
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
          className="mb-12 p-[1px] rounded-3xl bg-zinc-800"
        >
          <div className="bg-[#13131a] rounded-[23px] p-8 md:p-12 text-center relative overflow-hidden">
            
            <h3 className="text-2xl font-bold text-zinc-400 mb-4 relative z-10">Your Performance</h3>
            <div className="flex items-baseline justify-center gap-2 mb-8 relative z-10">
              <span className="text-7xl font-extrabold text-white">
                {calculateScore()}
              </span>
              <span className="text-3xl text-gray-500 font-medium">/ {testData.questions.length}</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-6 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(calculateScore() / testData.questions.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-electric-blue"
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
                question={q.questionText} // TODO: Flashcards might need Latex wrapping too, but TestEnvironment controls it
                answer={q.correctAnswer}
                explanation={q.explanation}
                imagePrompt={q.imagePrompt}
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
        <AnimatePresence>
          {localQuestions.map((q, index) => {
            let isCorrect = answers[q.id]?.value === q.correctAnswer;
            if (q.type === 'short_answer') {
              isCorrect = gradingResults[q.id]?.score >= 7;
            }
            const isAnswered = !!answers[q.id]?.value;
            const isGraded = showResults;
            const confidence = answers[q.id]?.confidence || 1.0;

            return (
              <motion.div 
                key={q.id} 
                variants={itemVariants}
                className={cn(
                  "p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300",
                  showResults 
                    ? (isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20') 
                    : 'bg-glass-surface border-white/5 hover:border-glass-border'
                )}
              >
                <div className="flex flex-col mb-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <span className="flex items-center justify-center bg-electric-blue/20 text-white font-bold rounded-xl w-12 h-12 shrink-0 text-xl border border-electric-blue/20">
                        {index + 1}
                      </span>
                      <div className="text-xl text-white font-medium pt-2 leading-relaxed prose prose-invert max-w-none">
                        <Latex>{q.questionText}</Latex>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => getHint(q.id, q.questionText, q.correctAnswer)}
                        className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all text-sm font-medium"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Hint
                      </button>
                      <button
                        type="button"
                        onClick={() => getAnalogy(q.id, q.questionText)}
                        className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                      >
                        <Brain className="w-4 h-4" />
                        Analogy
                      </button>
                      {/* Show Work / Whiteboard Button */}
                      {(q.type === 'mcq' || q.type === 'short_answer') && (
                        <button
                          type="button"
                          onClick={() => setShowWhiteboard(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className={cn(
                            "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium",
                            showWhiteboard[q.id] 
                              ? "bg-white/10/20 text-purple-300 border-white/10 hover:bg-white/10/30" 
                              : "bg-glass-surface text-zinc-400 border-glass-border hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          <Pen className="w-4 h-4" />
                          Work
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Whiteboard Display */}
                  {showWhiteboard[q.id] && (
                    <div className="ml-[4.5rem] mt-4 mb-6">
                      <Whiteboard />
                    </div>
                  )}

                  {/* Hint Display */}
                  {hints[q.id] && (
                    <div className="ml-[4.5rem] mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Socratic Hint</h4>
                      {hints[q.id].loading ? (
                        <div className="flex items-center gap-2 text-yellow-300/70">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Gathering thoughts...
                        </div>
                      ) : (
                        <div className="text-zinc-400 prose prose-invert text-sm">{hints[q.id].text}</div>
                      )}
                    </div>
                  )}

                  {/* Analogy Display */}
                  {analogies[q.id] && (
                    <div className="ml-[4.5rem] mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">Cross-Discipline Analogy ({analogies[q.id].discipline})</h4>
                      {analogies[q.id].loading ? (
                        <div className="flex items-center gap-2 text-emerald-300/70">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Generating analogy...
                        </div>
                      ) : (
                        <div className="text-zinc-400 prose prose-invert text-sm"><Latex>{analogies[q.id].text}</Latex></div>
                      )}
                    </div>
                  )}

                  {/* Confidence Tracker UI */}
                  {!showResults && isAnswered && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-[4.5rem] mt-4 flex items-center gap-4 bg-glass-surface p-3 rounded-xl border border-glass-border"
                    >
                      <span className="text-sm font-medium text-zinc-400">Confidence:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfidenceChange(q.id, 1.0)}
                          className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", confidence === 1.0 ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-glass-surface text-zinc-400 hover:bg-white/[0.06] border border-transparent")}
                        >
                          Certain
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfidenceChange(q.id, 0.5)}
                          className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", confidence === 0.5 ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-glass-surface text-zinc-400 hover:bg-white/[0.06] border border-transparent")}
                        >
                          Unsure
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfidenceChange(q.id, 0.0)}
                          className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", confidence === 0.0 ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-glass-surface text-zinc-400 hover:bg-white/[0.06] border border-transparent")}
                        >
                          Guess
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {(q.type === 'mcq' || q.type === 'true_false') && q.options && (
                  <div className="space-y-3 ml-[4.5rem]">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id]?.value === option;
                      const showCorrectHighlight = showResults && option === q.correctAnswer;
                      const showWrongHighlight = showResults && isSelected && !isCorrect;

                      let labelClass = "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ";
                      
                      if (showCorrectHighlight) {
                        labelClass += "bg-green-500/10 border-green-500/50 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                      } else if (showWrongHighlight) {
                        labelClass += "bg-red-500/10 border-red-500/50 text-red-200";
                      } else if (isSelected) {
                        labelClass += "bg-electric-blue/20 border-electric-blue text-white shadow-lg";
                      } else {
                        labelClass += "bg-glass-surface border-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-white";
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
                          <span className="text-lg flex-1"><Latex>{option}</Latex></span>
                          
                          {showCorrectHighlight && <CheckCircle2 className="w-6 h-6 text-green-400 ml-auto shrink-0" />}
                          {showWrongHighlight && <XCircle className="w-6 h-6 text-red-400 ml-auto shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                )}

                {(q.type === 'short_answer' || q.type === 'reverse_construction') && (
                  <div className="ml-[4.5rem]">
                    {q.type === 'reverse_construction' && (
                      <div className="mb-4 p-4 bg-zinc-9002/10 border border-white/10 rounded-xl text-orange-200">
                        <span className="font-bold text-xs uppercase tracking-wider block mb-1">Target Answer:</span>
                        <div className="text-lg"><Latex>{q.correctAnswer}</Latex></div>
                        <p className="text-sm mt-2 opacity-80">Construct the original formula or question that yields this answer.</p>
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={answers[q.id]?.value || ''}
                        onChange={(e) => handleOptionChange(q.id, e.target.value)}
                        disabled={showResults}
                        placeholder="Type or speak your answer here..."
                        className="w-full bg-glass-surface border border-glass-border rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                      />
                      {!showResults && (
                        <button
                          type="button"
                          onClick={() => startListening(q.id)}
                          className={cn(
                            "absolute top-4 right-4 p-2 rounded-full transition-colors",
                            recordingId === q.id 
                              ? "bg-red-500/20 text-red-400 animate-pulse" 
                              : "bg-glass-surface text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                          )}
                        >
                          {recordingId === q.id ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                      )}
                    </div>

                    {/* Grading Results for Short Answer */}
                    {showResults && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        {isGrading && !gradingResults[q.id] ? (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-electric-blue/10 border border-electric-blue/20 text-white">
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
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-glass-border">
                              <span className="font-bold uppercase tracking-wider text-sm text-zinc-400">AI Grade</span>
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
                            <p className="text-zinc-400 leading-relaxed">{gradingResults[q.id].feedback}</p>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                )}

                {q.type === 'slider_interactive' && q.variables && (
                  <div className="ml-[4.5rem]">
                    <PhysicsSliders
                      variables={q.variables as any}
                      disabled={showResults}
                      onChange={(values) => {
                        // The user can interact with the sliders. Their "answer" is the resulting values state.
                        handleOptionChange(q.id, JSON.stringify(values));
                      }}
                    />
                  </div>
                )}

                {q.type === 'coordinate_hotspot' && (
                  <div className="ml-[4.5rem] mt-4 flex justify-center">
                    <CartesianPlane
                      disabled={showResults}
                      correctAnswer={showResults && q.correctAnswer ? {
                        x: parseInt(q.correctAnswer.split(',')[0]),
                        y: parseInt(q.correctAnswer.split(',')[1])
                      } : null}
                      selectedCoordinate={answers[q.id]?.value ? {
                        x: parseInt(answers[q.id].value.split(',')[0]),
                        y: parseInt(answers[q.id].value.split(',')[1])
                      } : null}
                      onCoordinateSelect={(x, y) => handleOptionChange(q.id, `${x},${y}`)}
                    />
                  </div>
                )}

                {q.type === 'estimation' && (
                  <div className="ml-[4.5rem] mt-4">
                    <div className="bg-glass-surface border border-glass-border rounded-xl p-6">
                      <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider text-center">Order of Magnitude</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 font-mono text-sm">10<sup>-5</sup></span>
                        <input
                          type="range"
                          min="-5"
                          max="15"
                          step="1"
                          value={answers[q.id]?.value || "0"}
                          onChange={(e) => handleOptionChange(q.id, e.target.value)}
                          disabled={showResults}
                          className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                        />
                        <span className="text-zinc-400 font-mono text-sm">10<sup>15</sup></span>
                      </div>
                      <div className="mt-6 text-center">
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-electric-blue/20 border border-electric-blue/30 text-white font-mono text-xl">
                          10<sup>{answers[q.id]?.value || "0"}</sup>
                        </span>
                      </div>
                      {showResults && (
                        <div className="mt-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium",
                            answers[q.id]?.value === q.correctAnswer ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          )}>
                            Target: 10<sup>{q.correctAnswer}</sup>
                          </span>
                        </div>
                      )}
                    </div>
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
                        <div className="mb-4 pb-4 border-b border-glass-border">
                          <span className="text-sm font-bold tracking-wider uppercase text-zinc-400 block mb-1">Correct Answer</span>
                          <span className="text-lg text-white font-medium prose prose-invert max-w-none"><Latex>{q.correctAnswer}</Latex></span>
                          
                          {/* Fallacy / Trap Label */}
                          {(q as any).trapLabel && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/20 border border-red-500/30">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Cognitive Trap: {(q as any).trapLabel}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold tracking-wider uppercase text-zinc-400 block">AI Explanation</span>
                          <button
                            onClick={() => playAudio(q.explanation, q.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors border",
                              playingAudioId === q.id 
                                ? "bg-electric-blue/20 text-white border-electric-blue/50" 
                                : "bg-glass-surface text-zinc-400 hover:text-white hover:bg-white/[0.06] border-glass-border"
                            )}
                          >
                            {playingAudioId === q.id ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                            {playingAudioId === q.id ? "Stop Podcast" : "Listen"}
                          </button>
                        </div>
                        <p className="text-zinc-400 leading-relaxed prose prose-invert max-w-none"><Latex>{q.explanation}</Latex></p>
                        
                        {/* Multi-Step Breakdown UI */}
                        {q.steps && q.steps.length > 0 && (
                          <div className="mt-6 space-y-4">
                            <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-2">Step-by-Step Breakdown</h4>
                            {q.steps.map((step: any) => (
                              <div key={step.stepNumber} className={cn("p-4 rounded-lg border", q.flawIndex === step.stepNumber ? "bg-red-500/10 border-red-500/30" : "bg-glass-surface border-glass-border")}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-electric-blue/20 text-white text-xs font-bold">{step.stepNumber}</span>
                                  <span className="font-medium text-white">{step.title}</span>
                                  {q.flawIndex === step.stepNumber && <span className="ml-auto text-xs font-bold uppercase text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Intentional Flaw Here</span>}
                                </div>
                                <div className="text-sm text-zinc-400 mb-2 prose prose-invert max-w-none"><Latex>{step.logicalDeduction}</Latex></div>
                                {step.equation && (
                                  <div className="bg-black/30 p-3 rounded-lg text-center overflow-x-auto text-zinc-400">
                                    <Latex>{`$$${step.equation}$$`}</Latex>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Variation Button if Failed */}
                    {isGraded && !isCorrect && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => generateVariation(q)}
                          disabled={generatingVariation === q.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10/20 text-purple-300 hover:bg-white/10/30 transition-all text-sm font-bold border border-white/10"
                        >
                          {generatingVariation === q.id ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                          ) : (
                            <><Dna className="w-4 h-4" /> Try Infinite Variation</>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        </motion.div>
        {!showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky bottom-8 mt-12 bg-zinc-900/80 backdrop-blur-xl p-6 border border-glass-border shadow-2xl rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 z-50 print:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30">
                <span className="text-white font-bold">{Object.keys(answers).length}</span>
              </div>
              <span className="text-zinc-400 font-medium">
                of {testData.questions.length} answered
              </span>
            </div>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-electric-blue hover:bg-electric-blue font-semibold rounded-xl text-lg px-10 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
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
    </>
  );
}
