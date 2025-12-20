import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flag, AlertTriangle, Terminal, CheckCircle2, XCircle, Clock, LockKeyhole, Coins, Timer, Loader2, Download, FileCode } from 'lucide-react';
import { Challenge, User, Stats } from '../types';
import { getSolvedCases, saveSolvedCase, saveStats, getUserStats, getUnlockedHints, saveUnlockedHint, verifyFlag } from '../utils/storage';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GlitchText from '../components/ui/GlitchText';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/audio';

interface ChallengeDetailProps {
  challenge: Challenge;
  currentUser: User | null;
  onBack: () => void;
  onUpdateStats: (stats: Stats) => void;
}

const HINT_COST = 50;
const SUBMISSION_COOLDOWN_MS = 5000; // 5 seconds rate limit

const ChallengeDetailPage: React.FC<ChallengeDetailProps> = ({ challenge, currentUser, onBack, onUpdateStats }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isSolved, setIsSolved] = useState(false);
  const [isHintUnlocked, setIsHintUnlocked] = useState(false);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, points: 0 });
  const [timeLeft, setTimeLeft] = useState(challenge.duration || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  
  const MotionDiv = motion.div as any;

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const solved = await getSolvedCases(currentUser.id);
        setIsSolved(solved.includes(challenge.id));
        
        const currentStats = await getUserStats(currentUser.id);
        setStats(currentStats);

        const unlocked = await getUnlockedHints(currentUser.id);
        setIsHintUnlocked(unlocked.includes(challenge.id));
      }
    };
    init();
  }, [currentUser, challenge.id]);

  // Timer Logic
  useEffect(() => {
    if (isSolved) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSolved, challenge.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Rate Limiting Check
    const now = Date.now();
    if (now - lastAttemptTime < SUBMISSION_COOLDOWN_MS) {
        setFeedback({ type: 'error', message: `Cooldown Active. Wait ${Math.ceil((SUBMISSION_COOLDOWN_MS - (now - lastAttemptTime)) / 1000)}s.` });
        playErrorSound();
        return;
    }

    if (timeLeft === 0 && !isSolved) {
        playErrorSound();
        setFeedback({ type: 'error', message: 'Mission Failed. Time Limit Exceeded.' });
        return;
    }

    const sanitizedAnswer = answer.trim();
    if (!sanitizedAnswer) return;

    // Check if already solved
    if (isSolved) {
      setFeedback({ type: 'success', message: 'Challenge already completed.' });
      return;
    }

    setLastAttemptTime(now);
    setIsSubmitting(true);
    
    // Wait for 0.5 seconds for dramatic effect (and network buffering)
    await new Promise(resolve => setTimeout(resolve, 500));

    // SECURE VERIFICATION: Call backend
    const isValid = await verifyFlag(challenge.id, sanitizedAnswer, challenge.flag);

    // Refresh stats first
    const currentStats = await getUserStats(currentUser.id);
    const newStats = { ...currentStats, total: currentStats.total + 1 };
    
    setIsSubmitting(false);

    if (isValid) {
      // Success
      await saveSolvedCase(currentUser.id, challenge.id);
      newStats.correct += 1;
      newStats.points += challenge.points;
      await saveStats(currentUser.id, newStats);
      
      playSuccessSound();
      onUpdateStats(newStats);
      setIsSolved(true);
      setFeedback({ type: 'success', message: `Access Granted. System updated with ${challenge.points} points.` });
    } else {
      // Failure
      playErrorSound();
      await saveStats(currentUser.id, newStats);
      onUpdateStats(newStats);
      setFeedback({ type: 'error', message: 'Access Denied. Invalid flag credential.' });
    }
    setAnswer('');
  };

  const purchaseHint = async () => {
    if (!currentUser) return;
    playClickSound();
    
    if (stats.points >= HINT_COST) {
        const newStats = { ...stats, points: stats.points - HINT_COST };
        await saveStats(currentUser.id, newStats);
        await saveUnlockedHint(currentUser.id, challenge.id);
        
        setStats(newStats);
        onUpdateStats(newStats);
        setIsHintUnlocked(true);
    } else {
        playErrorSound();
        setFeedback({ type: 'error', message: `Insufficient funds. Cost: ${HINT_COST} PTS.` });
    }
  };

  const getTimerColor = () => {
    if (isSolved) return 'text-emerald-500 border-emerald-500/50 bg-emerald-900/20';
    if (timeLeft === 0) return 'text-red-600 border-red-600/50 bg-red-900/20 animate-pulse';
    if (timeLeft < 30) return 'text-red-500 border-red-500/50 bg-red-900/20 animate-pulse';
    return 'text-cyan-400 border-cyan-500/30 bg-cyan-900/20';
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <button 
            onClick={() => { playClickSound(); onBack(); }}
            className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm"
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> RETURN_TO_ROOT
        </button>

        {/* Floating Timer */}
        <div className={`flex items-center gap-3 px-6 py-2 rounded-lg border font-mono text-xl font-bold shadow-lg ${getTimerColor()}`}>
            <Timer className={`w-6 h-6 ${timeLeft < 30 && !isSolved ? 'animate-bounce' : ''}`} />
            {isSolved ? 'COMPLETE' : formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Terminal className="w-32 h-32 text-cyan-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded border border-slate-600">
                {challenge.difficulty}
              </span>
              <span className="text-cyan-400 font-mono font-bold">{challenge.points} PTS</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4"><GlitchText text={challenge.title} /></h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">{challenge.description}</p>
            
            {/* FILE ATTACHMENT SECTION */}
            {challenge.fileUrl && (
              <div className="mb-8">
                 <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center">
                   <FileCode className="w-4 h-4 mr-2" /> Mission Assets
                 </h4>
                 <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors group">
                    <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center mr-4 group-hover:bg-cyan-900/30 transition-colors">
                       <FileCode className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div className="flex-grow">
                       <div className="text-white font-mono text-sm">Target_File.bin</div>
                       <div className="text-xs text-slate-500">Binary Execution Required</div>
                    </div>
                    <a 
                      href={challenge.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 rounded flex items-center hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold"
                      onClick={playClickSound}
                    >
                       <Download className="w-4 h-4 mr-2" />
                       DOWNLOAD
                    </a>
                 </div>
              </div>
            )}

            <div className={`bg-black/40 rounded-lg p-6 border-l-4 ${isHintUnlocked ? 'border-yellow-500' : 'border-slate-700'}`}>
              <h3 className={`${isHintUnlocked ? 'text-yellow-500' : 'text-slate-400'} font-bold mb-2 flex items-center`}>
                <AlertTriangle className="w-5 h-5 mr-2" /> INTELLIGENCE HINT
              </h3>
              
              {isHintUnlocked ? (
                <p className="text-slate-400 font-mono text-sm">{challenge.hint}</p>
              ) : (
                <div className="flex flex-col items-start gap-3">
                    <p className="text-slate-500 font-mono text-sm italic">
                        [ENCRYPTED CONTENT] Purchase decryption key to view intelligence.
                    </p>
                    <Button 
                        onClick={purchaseHint}
                        variant="ghost"
                        className="bg-yellow-900/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-900/40 hover:text-yellow-400 text-xs py-2 px-4"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        PURCHASE KEY (-{HINT_COST} PTS)
                    </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submission Area */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Flag className="w-6 h-6 mr-3 text-cyan-500" /> 
              Submit Flag
            </h3>
            
            {/* Loading Overlay */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center"
                    >
                        <div className="font-mono text-cyan-500 mb-4 animate-pulse">VERIFYING HASH...</div>
                        <div className="w-48 h-2 bg-slate-800 rounded overflow-hidden">
                            <motion.div 
                                className="h-full bg-cyan-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.0, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isSolved ? (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center"
               >
                 <div className="inline-flex p-3 rounded-full bg-emerald-900/50 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <h4 className="text-xl font-bold text-emerald-400 mb-2">Challenge Conquered</h4>
                 <p className="text-emerald-200/70">Flag captured successfully. Good work, agent.</p>
               </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  placeholder="flag{...}" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="font-mono"
                  disabled={timeLeft === 0 || isSubmitting}
                />
                <Button type="submit" className="w-full" disabled={timeLeft === 0 || isSubmitting}>
                  {timeLeft === 0 ? 'TIME EXPIRED' : isSubmitting ? 'PROCESSING...' : 'VERIFY FLAG'}
                </Button>
              </form>
            )}

            {(feedback.message && !isSolved && !isSubmitting) && (
              <MotionDiv 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg flex items-center ${
                  feedback.type === 'error' ? 'bg-red-900/20 text-red-300 border border-red-500/20' : 'bg-emerald-900/20 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {feedback.type === 'error' ? <XCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
                {feedback.message}
              </MotionDiv>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">ID</span>
                <span className="text-slate-300">{challenge.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-300">
                   {challenge.title.toLowerCase().includes('sql') || challenge.title.toLowerCase().includes('cross') ? 'Web Security' : 
                    challenge.title.toLowerCase().includes('rsa') || challenge.title.toLowerCase().includes('caesar') ? 'Cryptography' : 'Pwn'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Limit</span>
                <span className="text-cyan-400">{challenge.estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reward</span>
                <span className="text-emerald-400">+{challenge.points} PTS</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Wallet</h3>
             <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Balance</span>
                <span className="text-yellow-400 font-mono font-bold text-lg">{stats.points} PTS</span>
             </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ChallengeDetailPage;