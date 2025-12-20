import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const EventCountdown: React.FC = () => {
  // Set end date to 24 hours from now for demo purposes
  // In a real event, set this to a specific ISO string date
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
      <div className="flex items-center text-cyan-400 border-r border-slate-700 pr-4">
        <Timer className="w-5 h-5 mr-2 animate-pulse" />
        <span className="text-xs font-bold tracking-widest uppercase">Event Ends In</span>
      </div>
      <div className="flex space-x-2 font-mono text-xl font-bold text-white">
        <div className="flex flex-col items-center">
          <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-500 uppercase font-sans">Hrs</span>
        </div>
        <span className="text-slate-600">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-500 uppercase font-sans">Min</span>
        </div>
        <span className="text-slate-600">:</span>
        <div className="flex flex-col items-center">
          <span className="text-cyan-400">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-500 uppercase font-sans">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default EventCountdown;