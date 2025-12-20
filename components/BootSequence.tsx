import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const BOOT_LOGS = [
  "INITIALIZING KERNEL...",
  "LOADING MODULES: SECURITY, CRYPTO, NETWORKING...",
  "VERIFYING INTEGRITY SIGNATURES...",
  "ESTABLISHING SECURE CONNECTION...",
  "BYPASSING FIREWALLS...",
  "MOUNTING VIRTUAL DRIVES...",
  "ACCESSING MAINFRAME...",
  "DECRYPTING USER DATA...",
  "SYSTEM READY."
];

interface BootSequenceProps {
  onComplete: () => void;
  isDataReady: boolean;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, isDataReady }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [animationDone, setAnimationDone] = useState(false);
  
  useEffect(() => {
    let delay = 0;
    const timeouts: NodeJS.Timeout[] = [];

    BOOT_LOGS.forEach((log, index) => {
      // Randomize delay for realistic typing feel
      const stepDelay = Math.random() * 300 + 150;
      delay += stepDelay;
      
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, log]);
        
        // If this is the last log, mark animation as done
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(() => {
            setAnimationDone(true);
          }, 800);
        }
      }, delay);
      
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Only complete when both animation is done AND data is ready (session checked)
  useEffect(() => {
    if (animationDone && isDataReady) {
      onComplete();
    }
  }, [animationDone, isDataReady, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col justify-between p-8 md:p-12 font-mono text-cyan-500 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[101] pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>
      
      <div className="flex items-center space-x-2 mb-8 opacity-80">
        <Terminal className="w-6 h-6 animate-pulse" />
        <span className="text-sm font-bold tracking-widest">CYBERHACK BIOS v4.0.2</span>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-1 text-sm md:text-base text-shadow-glow"
          >
            <span className="text-slate-600 mr-3">[{new Date().toLocaleTimeString('en-US', {hour12: false})}]</span>
            <span className={i === BOOT_LOGS.length - 1 ? "text-emerald-400 font-bold" : "text-cyan-500"}>
              {log}
            </span>
          </motion.div>
        ))}
        
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-3 h-5 bg-cyan-500 mt-1"
        />
      </div>

      <div className="mt-8 border-t border-slate-800 pt-4 flex justify-between items-end">
        <div className="text-xs text-slate-600">
          MEMORY: 64TB OK<br/>
          CPU: QUANTUM CORE i9
        </div>
        <div className="text-right">
           {animationDone && !isDataReady && (
             <span className="text-yellow-500 text-xs animate-pulse">WAITING FOR NETWORK...</span>
           )}
        </div>
      </div>
    </div>
  );
};

export default BootSequence;