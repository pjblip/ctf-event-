import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, ChevronRight, Lock, Clock, Shield, AlertTriangle, Skull, ArrowLeft, Loader2, Users, Star } from 'lucide-react';
import { getSolvedCases, getChallenges, getChallengeSolveCounts } from '../utils/storage';
import { supabase, isRealBackend } from '../services/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Challenge, User } from '../types';

interface ChallengesPageProps {
  currentUser: User | null;
  onSelectCase: (challenge: Challenge) => void;
  onNavigate: (page: string) => void;
}

const ChallengesPage: React.FC<ChallengesPageProps> = ({ currentUser, onSelectCase, onNavigate }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);
  const [solveCounts, setSolveCounts] = useState<Record<string, number>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const MotionDiv = motion.div as any;

  const refreshData = async () => {
      if (!currentUser) return;
      const [solved, loadedChallenges, counts] = await Promise.all([
        getSolvedCases(currentUser.id),
        getChallenges(),
        getChallengeSolveCounts()
      ]);
      setSolvedCases(solved);
      setChallenges(loadedChallenges);
      setSolveCounts(counts);
      setIsLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Real-time subscription for solve counts
    if (isRealBackend()) {
        const channel = supabase
            .channel('public:solves_counts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solves' }, () => {
                // When a new solve happens, just refresh counts to stay accurate
                getChallengeSolveCounts().then(setSolveCounts);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-16 h-16 text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-slate-400 mb-8 max-w-md">You must be logged in to access the classified challenge database.</p>
        <Button onClick={() => onNavigate('login')}>Authenticate Now</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-cyan-400 font-mono text-sm animate-pulse">DECRYPTING MISSION FILES...</p>
        </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // View: Difficulty Categories
  if (!selectedDifficulty) {
    return (
      <div className="py-8">
        <div className="text-center mb-12">
           <motion.h2 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-extrabold text-white mb-4"
           >
             Select Operations Tier
           </motion.h2>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-slate-400 max-w-xl mx-auto"
           >
             Choose your mission difficulty. Higher clearance levels utilize tighter time windows and advanced countermeasures.
           </motion.p>
        </div>

        <MotionDiv 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Easy Card */}
          <MotionDiv variants={item} className="h-full">
            <Card 
              onClick={() => setSelectedDifficulty('easy')}
              className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-emerald-500 hover:bg-emerald-900/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Shield className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">RECRUIT</h3>
              <div className="text-emerald-400 font-bold tracking-widest text-sm mb-6 relative z-10">EASY TIER</div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                Introductory protocols for new agents. Basic web and crypto tasks.
              </p>
              <div className="mt-auto flex items-center text-emerald-400 font-mono text-sm border border-emerald-500/30 bg-emerald-900/20 px-4 py-2 rounded relative z-10">
                <Clock className="w-4 h-4 mr-2" />
                1-2 MIN LIMIT
              </div>
            </Card>
          </MotionDiv>

          {/* Medium Card */}
          <MotionDiv variants={item} className="h-full">
            <Card 
              onClick={() => setSelectedDifficulty('medium')}
              className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-yellow-500 hover:bg-yellow-900/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-20 h-20 bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">OPERATIVE</h3>
              <div className="text-yellow-400 font-bold tracking-widest text-sm mb-6 relative z-10">MEDIUM TIER</div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                Standard field operations. SQL injection, buffer overflows, and logic errors.
              </p>
              <div className="mt-auto flex items-center text-yellow-400 font-mono text-sm border border-yellow-500/30 bg-yellow-900/20 px-4 py-2 rounded relative z-10">
                <Clock className="w-4 h-4 mr-2" />
                5-10 MIN LIMIT
              </div>
            </Card>
          </MotionDiv>

          {/* Hard Card */}
          <MotionDiv variants={item} className="h-full">
            <Card 
              onClick={() => setSelectedDifficulty('hard')}
              className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-red-500 hover:bg-red-900/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Skull className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">BLACK OPS</h3>
              <div className="text-red-400 font-bold tracking-widest text-sm mb-6 relative z-10">HARD TIER</div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                Elite level challenges. Advanced RSA, binary exploitation, and zero-days.
              </p>
              <div className="mt-auto flex items-center text-red-400 font-mono text-sm border border-red-500/30 bg-red-900/20 px-4 py-2 rounded relative z-10">
                <Clock className="w-4 h-4 mr-2" />
                15 MIN LIMIT
              </div>
            </Card>
          </MotionDiv>
        </MotionDiv>
      </div>
    );
  }

  // View: Challenge List for Selected Difficulty
  const filteredCases = challenges.filter(c => c.difficulty === selectedDifficulty);
  const totalPoints = filteredCases.reduce((acc, curr) => acc + curr.points, 0);
  const userPointsInTier = filteredCases
    .filter(c => solvedCases.includes(c.id))
    .reduce((acc, curr) => acc + curr.points, 0);
  const progressPercent = totalPoints > 0 ? (userPointsInTier / totalPoints) * 100 : 0;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <button 
          onClick={() => setSelectedDifficulty(null)}
          className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          BACK TO TIERS
        </button>
        <div className="text-right w-full md:w-auto">
          <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Active Sector</div>
          <div className={`text-xl font-mono uppercase font-bold ${
            selectedDifficulty === 'easy' ? 'text-emerald-400' : 
            selectedDifficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {selectedDifficulty} PROTOCOLS
          </div>
        </div>
      </div>

      {/* Progress Bar for Tier */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-slate-900/50 border border-slate-800 rounded-lg p-4"
      >
        <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-400 font-mono">SECTOR COMPLETION</span>
            <span className="text-xs text-white font-mono font-bold">{userPointsInTier} / {totalPoints} PTS</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                    selectedDifficulty === 'easy' ? 'bg-emerald-500' : 
                    selectedDifficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
            />
        </div>
      </motion.div>

      <MotionDiv 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCases.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No active missions in this sector.
            </div>
        ) : filteredCases.map((challenge) => {
          const isSolved = solvedCases.includes(challenge.id);
          const solvedCount = solveCounts[challenge.id] || 0;
          
          const difficultyColor = {
            easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
            hard: 'text-red-400 bg-red-400/10 border-red-400/20',
          }[challenge.difficulty];

          return (
            <MotionDiv key={challenge.id} variants={item}>
              <Card 
                onClick={() => onSelectCase(challenge)}
                className={`group h-full flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isSolved 
                    ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'hover:border-cyan-500/50'
                }`}
              >
                {/* Solved Overlay Pattern */}
                {isSolved && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Check className="w-24 h-24 text-emerald-500" />
                    </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${difficultyColor}`}>
                      {challenge.difficulty}
                    </span>
                    {isSolved ? (
                      <div className="flex items-center text-emerald-400 text-sm font-bold bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/20">
                        <Check className="w-4 h-4 mr-1" /> COMPLETED
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                         <span className="text-cyan-400 font-mono font-bold text-sm">
                           {challenge.points} PTS
                         </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-1 relative z-10">
                    {challenge.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 relative z-10">
                    {challenge.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800 relative z-10">
                  <span className="text-slate-500 text-xs flex items-center" title={`${solvedCount} agents solved this`}>
                      <Users className="w-3 h-3 mr-1" /> {solvedCount} Solves
                  </span>
                  <div className={`flex items-center text-sm font-medium transition-colors ${isSolved ? 'text-emerald-500' : 'text-slate-500 group-hover:text-white'}`}>
                    {isSolved ? 'REVIEW' : 'INITIALIZE'} <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </MotionDiv>
          );
        })}
      </MotionDiv>
    </div>
  );
};

export default ChallengesPage;