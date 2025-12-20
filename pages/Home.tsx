import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Trophy, Code, Lock, Cpu, Bitcoin, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlitchText from '../components/ui/GlitchText';
import EventCountdown from '../components/EventCountdown';
import ActivityFeed from '../components/ActivityFeed';
import Terminal from '../components/Terminal';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomeProps> = ({ onNavigate }) => {
  const MotionDiv = motion.div as any;
  const MotionH1 = motion.h1 as any;
  const MotionP = motion.p as any;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="relative py-8 lg:py-12">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] -z-10" />

      <MotionDiv 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 relative z-10"
      >
        {/* Left Column: Hero Content */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <MotionDiv variants={itemVariants} className="flex items-center mb-6 space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
              <Shield className="relative w-16 h-16 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
            <div className="px-3 py-1 bg-cyan-950/30 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              System Status: ONLINE
            </div>
          </MotionDiv>
          
          <MotionH1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            <GlitchText text="CAPTURE" /> THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 neon-text">
              <GlitchText text="FLAG" />
            </span>
          </MotionH1>
          
          <MotionP variants={itemVariants} className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed border-l-2 border-purple-500/50 pl-6">
            Initialize your terminal. Join the elite community of ethical hackers. Solve realistic security challenges and dominate the leaderboard in a high-fidelity simulation.
          </MotionP>
          
          <MotionDiv variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => onNavigate('cases')} icon={<Target className="w-5 h-5"/>}>
              Start Hacking
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('leaderboard')} icon={<Trophy className="w-5 h-5"/>}>
              Global Rankings
            </Button>
          </MotionDiv>
        </div>

        {/* Right Column: Interactive Dashboard */}
        <div className="lg:col-span-5 space-y-6">
           <MotionDiv variants={itemVariants} className="w-full">
             <Terminal />
           </MotionDiv>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
             <MotionDiv variants={itemVariants} className="w-full">
               <EventCountdown />
             </MotionDiv>
             <MotionDiv variants={itemVariants}>
               <ActivityFeed />
             </MotionDiv>
           </div>
        </div>
      </MotionDiv>

      {/* Protocols / Rules Section */}
      <MotionDiv 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <div className="relative border border-slate-800 bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 md:p-12 overflow-hidden group hover:border-purple-500/30 transition-colors shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
            <Bitcoin className="w-64 h-64 text-yellow-500" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              MISSION PROTOCOLS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center text-cyan-400 font-bold text-lg mb-2">
                  <Target className="w-5 h-5 mr-2" /> 
                  DIFFICULTY LEVELS
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Operations are strict. 
                  <span className="text-emerald-400 font-bold"> EASY</span> (1 MIN), 
                  <span className="text-yellow-400 font-bold"> MEDIUM</span> (3 MIN), and 
                  <span className="text-red-400 font-bold"> HARD</span> (5-6 MIN). 
                  Manage your time or face termination.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-cyan-400 font-bold text-lg mb-2">
                  <Clock className="w-5 h-5 mr-2" /> 
                  TIME CONSTRAINTS
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Time is your most valuable asset. Complete challenges within the designated windows to maximize your efficiency rating.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-cyan-400 font-bold text-lg mb-2">
                  <Bitcoin className="w-5 h-5 mr-2 text-yellow-500" /> 
                  CRYPTO ECONOMY
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your bounty currency is your lifeline. Earn points by solving cases and 
                  <span className="text-white font-bold"> sell your currency</span> to purchase critical intelligence hints when you are stuck.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionDiv>

      <MotionDiv 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <Card hoverEffect className="border-t-4 border-t-cyan-500">
          <div className="h-12 w-12 bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
            <GlitchText text="Web Security" />
          </h3>
          <p className="text-slate-400 text-sm">Master XSS, SQL Injection, and authentication bypass techniques in simulated environments.</p>
          <div className="mt-4 flex items-center text-cyan-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Access Module <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Card>
        
        <Card hoverEffect className="border-t-4 border-t-purple-500">
          <div className="h-12 w-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
            <GlitchText text="Cryptography" />
          </h3>
          <p className="text-slate-400 text-sm">Crack ciphers, analyze hash collisions, and decrypt secret communications.</p>
          <div className="mt-4 flex items-center text-purple-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Access Module <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Card>
        
        <Card hoverEffect className="border-t-4 border-t-pink-500">
          <div className="h-12 w-12 bg-pink-900/30 rounded-lg flex items-center justify-center mb-4 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
            <GlitchText text="Binary Exploitation" />
          </h3>
          <p className="text-slate-400 text-sm">Dive deep into memory corruption, buffer overflows, and reverse engineering.</p>
          <div className="mt-4 flex items-center text-pink-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Access Module <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Card>
      </MotionDiv>
    </div>
  );
};

export default HomePage;