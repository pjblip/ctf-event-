import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isRealBackend } from '../services/supabase';

// Helper to generate fake data for demo mode or initial state
const MOCK_ACTIVITIES = [
  { id: 'm1', user: 'Neo_Matrix', action: 'cracked', target: 'Web Security 01', type: 'web' },
  { id: 'm2', user: 'MrRobot', action: 'infiltrated', target: 'Server Mainframe', type: 'pwn' },
  { id: 'm3', user: 'ZeroCool', action: 'decrypted', target: 'RSA Key', type: 'crypto' },
];

interface ActivityItem {
  id: string | number;
  user: string;
  action: string;
  target: string;
  type: string;
  timestamp: string;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial Load
    setActivities(MOCK_ACTIVITIES.map(m => ({ ...m, timestamp: new Date().toLocaleTimeString() })));
    
    if (!isRealBackend()) {
      // Mock Mode Loop
      const interval = setInterval(() => {
        const randomActivity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
        const newActivity = { 
            ...randomActivity, 
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 5));
      }, 5000);
      return () => clearInterval(interval);
    } else {
      // REAL MODE: Subscribe to 'solves' table
      setIsConnected(true);
      
      const channel = supabase
        .channel('public:solves')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'solves' },
          async (payload: any) => {
            // New solve detected!
            // We need to fetch the username and challenge title because the payload only has IDs
            const { user_id, challenge_id } = payload.new;

            try {
              // Parallel fetch for speed
              const [userRes, challengeRes] = await Promise.all([
                 supabase.from('profiles').select('username').eq('id', user_id).single(),
                 supabase.from('challenges').select('title, difficulty').eq('id', challenge_id).single()
              ]);

              if (userRes.data && challengeRes.data) {
                 const newActivity: ActivityItem = {
                    id: payload.new.id,
                    user: userRes.data.username || 'Unknown Agent',
                    action: 'captured flag',
                    target: challengeRes.data.title,
                    type: challengeRes.data.difficulty,
                    timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })
                 };
                 setActivities(prev => [newActivity, ...prev].slice(0, 5));
              }
            } catch (e) {
                console.error("Error processing live activity", e);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center">
             <div className="relative mr-2">
                <div className={`w-2 h-2 rounded-full ${isConnected || !isRealBackend() ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                <div className={`absolute inset-0 w-2 h-2 rounded-full ${isConnected || !isRealBackend() ? 'bg-green-500' : 'bg-yellow-500'} animate-ping opacity-75`}></div>
             </div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                 {isRealBackend() ? 'Live Network Traffic' : 'Simulated Traffic'}
             </h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex flex-col sm:flex-row sm:items-center text-sm font-mono border-l-2 border-slate-800 pl-3 py-1 hover:border-cyan-500 transition-colors"
            >
              <span className="text-slate-600 text-xs mr-2 w-16 flex-shrink-0">[{item.timestamp}]</span>
              <div className="flex items-center flex-wrap">
                  <span className="text-cyan-400 font-bold mr-2">{item.user}</span>
                  <span className="text-slate-400 mr-2 text-xs uppercase">{item.action}</span>
                  <span className={`truncate font-bold ${
                      item.type === 'hard' ? 'text-red-500' : 
                      item.type === 'medium' ? 'text-yellow-500' : 'text-emerald-400'
                  }`}>
                    {item.target}
                  </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {activities.length === 0 && (
            <div className="text-slate-600 text-xs text-center py-4 italic">Waiting for incoming signals...</div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;