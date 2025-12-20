import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, User as UserIcon, Crown, Activity } from 'lucide-react';
import { User } from '../types';
import { supabase, isRealBackend } from '../services/supabase';
import { getUserStats } from '../utils/storage';

interface LeaderboardProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

// Simulated competitors for fallback
const MOCK_RIVALS = [
  { id: 'bot1', username: 'MrRobot', points: 1450, correct: 5 },
  { id: 'bot2', username: 'Neo_Matrix', points: 1200, correct: 4 },
  { id: 'bot3', username: 'Trinity', points: 950, correct: 3 },
  { id: 'bot4', username: 'AcidBurn', points: 800, correct: 3 },
  { id: 'bot5', username: 'CrashOverride', points: 600, correct: 2 },
  { id: 'bot6', username: 'CerealKiller', points: 450, correct: 2 },
  { id: 'bot7', username: 'ZeroCool', points: 300, correct: 1 },
];

const LeaderboardPage: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const MotionDiv = motion.div as any;
  const MotionTr = motion.tr as any;

  const fetchLeaderboard = async () => {
    let data: any[] = [];
    
    if (isRealBackend()) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, points, solved_count')
          .order('points', { ascending: false })
          .limit(50); // Increased limit for 20-30 students
          
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

    // Fallback logic
    if (data.length === 0) {
      data = [...MOCK_RIVALS];
      if (currentUser) {
         const stats = await getUserStats(currentUser.id);
         const exists = data.find(u => u.username === currentUser.username);
         if (!exists) {
           data.push({
             id: currentUser.id,
             username: currentUser.username,
             points: stats.points,
             correct: stats.correct
           });
         }
         data.sort((a, b) => b.points - a.points);
      }
    }
    
    setLeaderboardData(data);
  };

  useEffect(() => {
    fetchLeaderboard();

    // REAL-TIME SUBSCRIPTION
    if (isRealBackend()) {
      const subscription = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
          // When any profile changes (points update), re-fetch the leaderboard
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
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-yellow-500 mr-3" />
          Global Leaderboard
        </h2>
        <div className="flex items-center justify-center gap-2 text-slate-400">
           <p>Top operatives ranked by mission efficiency.</p>
           {isLive && (
             <span className="flex items-center text-xs font-mono text-red-500 bg-red-950/30 px-2 py-1 rounded border border-red-500/30 animate-pulse">
               <Activity className="w-3 h-3 mr-1" /> LIVE FEED
             </span>
           )}
        </div>
      </div>

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm"
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-6 font-semibold w-24 text-center">Rank</th>
              <th className="p-6 font-semibold">Operative</th>
              <th className="p-6 font-semibold text-right">Flags Captured</th>
              <th className="p-6 font-semibold text-right">Total Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaderboardData.map((user, index) => {
              const isCurrentUser = currentUser?.username === user.username;
              const rank = index + 1;
              
              let RankIcon = null;
              if (rank === 1) RankIcon = <Crown className="w-6 h-6 text-yellow-500" />;
              else if (rank === 2) RankIcon = <Medal className="w-6 h-6 text-slate-300" />;
              else if (rank === 3) RankIcon = <Medal className="w-6 h-6 text-amber-700" />;

              return (
                <MotionTr 
                  layout // Animates position changes when ranking updates
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    transition-colors hover:bg-slate-800/30
                    ${isCurrentUser ? 'bg-cyan-900/20 border-l-4 border-l-cyan-500' : ''}
                    ${rank <= 3 ? 'font-bold' : ''}
                  `}
                >
                  <td className="p-6 text-center">
                    <div className="flex justify-center items-center">
                      {RankIcon ? RankIcon : <span className="text-slate-500 font-mono">#{rank}</span>}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isCurrentUser ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className={isCurrentUser ? 'text-cyan-400' : 'text-white'}>
                        {user.username} {isCurrentUser && '(YOU)'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right font-mono text-slate-400">
                    {user.correct}
                  </td>
                  <td className="p-6 text-right">
                    <span className={`font-mono text-lg ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                      {user.points.toLocaleString()} PTS
                    </span>
                  </td>
                </MotionTr>
              );
            })}
          </tbody>
        </table>
      </MotionDiv>
    </div>
  );
};

export default LeaderboardPage;