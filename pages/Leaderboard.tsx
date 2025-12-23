import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, User as UserIcon, Crown, Activity, Target } from 'lucide-react';
import { User } from '../types';
import { supabase, isRealBackend } from '../services/supabase';
import { getUserStats } from '../utils/storage';

interface LeaderboardProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

const LeaderboardPage: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const MotionTr = motion.tr as any;

  const fetchLeaderboard = async () => {
    let data: any[] = [];
    
    if (isRealBackend()) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, points, solved_count')
          .order('points', { ascending: false })
          .limit(50);
          
        if (profiles && !error) {
          data = profiles.map((p: any) => ({
            id: p.id,
            username: p.username || 'Anonymous',
            points: p.points,
            correct: p.solved_count
          }));
          setIsLive(true);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
      }
    }

    // In local mode (or if DB is empty), we only display the current user if they exist
    // This satisfies the requirement to remove "wasted names" (bots)
    if (data.length === 0 && currentUser) {
         const stats = await getUserStats(currentUser.id);
         data.push({
           id: currentUser.id,
           username: currentUser.username,
           points: stats.points,
           correct: stats.correct
         });
    } else if (data.length > 0 && currentUser) {
        // Even if we fetched data, if the current user isn't in top 50 (or in the list), 
        // we might want to append them for UX, but typically leaderboard shows top X.
        // However, if we are in local dev with a real backend but freshly started, the user might not be in 'profiles' table 
        // until 'saveStats' triggers at least once or auth hook creates it. 
        // For now, we rely on the DB data.
        
        // Check if current user is missing from data (could happen if new user hasn't saved stats yet)
        const userInList = data.find(u => u.username === currentUser.username);
        if (!userInList && !isRealBackend()) {
             const stats = await getUserStats(currentUser.id);
             data.push({
                id: currentUser.id,
                username: currentUser.username,
                points: stats.points,
                correct: stats.correct
             });
        }
    }
    
    // Sort
    data.sort((a, b) => b.points - a.points);
    setLeaderboardData(data);
  };

  useEffect(() => {
    fetchLeaderboard();

    // REAL-TIME SUBSCRIPTION
    if (isRealBackend()) {
      const subscription = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
          fetchLeaderboard();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [currentUser]);

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <h2 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-yellow-500 mr-3 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          Global Leaderboard
        </h2>
        <div className="flex items-center justify-center gap-3 text-slate-400">
           <p className="font-mono text-sm">ELITE OPERATIVES RANKING</p>
           {isLive && (
             <span className="flex items-center text-[10px] font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 animate-pulse tracking-wider">
               <Activity className="w-3 h-3 mr-1" /> LIVE
             </span>
           )}
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <th className="p-6 font-bold w-24 text-center">Rank</th>
              <th className="p-6 font-bold">Operative</th>
              <th className="p-6 font-bold text-right hidden sm:table-cell">Flags</th>
              <th className="p-6 font-bold text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <AnimatePresence>
                {leaderboardData.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                            No active operatives detected. Waiting for login...
                        </td>
                    </tr>
                ) : (
                    leaderboardData.map((user, index) => {
                    const isCurrentUser = currentUser?.username === user.username;
                    const rank = index + 1;
                    
                    let RankIcon = null;
                    if (rank === 1) RankIcon = <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
                    else if (rank === 2) RankIcon = <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />;
                    else if (rank === 3) RankIcon = <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />;

                    return (
                        <MotionTr 
                        layout
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`
                            relative
                            transition-all duration-300
                            ${isCurrentUser 
                                ? 'bg-cyan-950/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] z-10' 
                                : 'hover:bg-slate-800/40'}
                        `}
                        >
                        {/* Highlighting border for current user */}
                        {isCurrentUser && (
                            <td className="absolute inset-y-0 left-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></td>
                        )}

                        <td className="p-6 text-center">
                            <div className="flex justify-center items-center">
                            {RankIcon ? (
                                <div className="scale-110 transform transition-transform hover:scale-125">{RankIcon}</div>
                            ) : (
                                <span className="text-slate-500 font-mono font-bold">#{rank.toString().padStart(2, '0')}</span>
                            )}
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg ${
                                isCurrentUser 
                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-cyan-500/20' 
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-bold tracking-tight text-lg ${
                                    isCurrentUser ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]' : 'text-slate-200'
                                }`}>
                                {user.username}
                                </span>
                                {isCurrentUser && (
                                    <span className="text-[10px] text-cyan-600 font-mono uppercase tracking-widest font-bold">
                                        Current Session
                                    </span>
                                )}
                            </div>
                            </div>
                        </td>
                        <td className="p-6 text-right hidden sm:table-cell">
                             <div className="inline-flex items-center bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                                <Target className="w-3 h-3 text-emerald-400 mr-2" />
                                <span className="font-mono text-emerald-400 font-bold">{user.correct}</span>
                             </div>
                        </td>
                        <td className="p-6 text-right">
                            <div className={`font-mono text-xl font-bold ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                            {user.points.toLocaleString()}
                            <span className="text-xs text-slate-500 ml-1">PTS</span>
                            </div>
                        </td>
                        </MotionTr>
                    );
                    })
                )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;