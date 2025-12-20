import React from 'react';
import { Shield, Trophy, Target, LogOut, User as UserIcon, Users, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stats } from '../types';
import { playHoverSound, playClickSound } from '../utils/audio';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userStats: Stats;
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  isAdmin?: boolean;
  onOpenProfile?: () => void;
  isLiveMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, userStats, isLoggedIn, onLogout, username, isAdmin, onOpenProfile, isLiveMode = false }) => {
  
  const NavItem = ({ page, label, icon: Icon }: { page: string; label: string; icon?: React.ElementType }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => {
            playClickSound();
            onNavigate(page);
        }}
        onMouseEnter={() => playHoverSound()}
        className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 z-10 ${
           isActive ? 'text-white' : 'text-slate-400 hover:text-cyan-200'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="navbar-active"
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl">
      {/* Gradient Line at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <div 
                className="flex items-center cursor-pointer group" 
                onClick={() => { playClickSound(); onNavigate('home'); }}
                onMouseEnter={() => playHoverSound()}
            >
                <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-cyan-900/20 group-hover:shadow-purple-500/40 transition-all group-hover:rotate-12 border border-white/10">
                   <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                CYBER<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">HACK</span>
                </span>
            </div>

            {/* Network Status Indicator */}
            <div className={`hidden lg:flex items-center text-[10px] font-mono border px-2 py-1 rounded-full ${isLiveMode ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400' : 'border-yellow-500/30 bg-yellow-900/10 text-yellow-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isLiveMode ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
                {isLiveMode ? 'NET: LIVE' : 'NET: SIM'}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <NavItem page="home" label="Home" />
            <NavItem page="cases" label="Challenges" icon={Target} />
            {isAdmin && <NavItem page="leaderboard" label="Leaderboard" icon={Trophy} />}
            <NavItem page="team" label="Team" icon={Users} />
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => { playClickSound(); onOpenProfile && onOpenProfile(); }}
                  onMouseEnter={() => playHoverSound()}
                  className="hidden sm:flex items-center px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700 hover:border-purple-500/50 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mr-2 border border-slate-600 group-hover:border-purple-500">
                    <UserIcon className="w-3 h-3 text-slate-400 group-hover:text-purple-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 mr-3 group-hover:text-white transition-colors">{username}</span>
                  <div className="h-4 w-px bg-slate-700 mr-3"></div>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{userStats.points} PTS</span>
                </button>
                <button 
                  onClick={() => { playClickSound(); onLogout(); }}
                  onMouseEnter={() => playHoverSound()}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors hover:bg-red-900/10 rounded-full"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button 
                    onClick={() => { playClickSound(); onNavigate('login'); }} 
                    onMouseEnter={() => playHoverSound()}
                    className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                    Login
                </button>
                <button 
                    onClick={() => { playClickSound(); onNavigate('signup'); }} 
                    onMouseEnter={() => playHoverSound()}
                    className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/10"
                >
                    Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;