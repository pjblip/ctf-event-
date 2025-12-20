import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase, isRealBackend } from './services/supabase';
import { getUserStats } from './utils/storage';
import Navbar from './components/Navbar';
import MatrixBackground from './components/MatrixBackground';
import HomePage from './pages/Home';
import ChallengesPage from './pages/Challenges';
import ChallengeDetailPage from './pages/ChallengeDetail';
import LeaderboardPage from './pages/Leaderboard';
import TeamPage from './pages/Team';
import AuthPage from './pages/Auth';
import { User, Challenge, Stats } from './types';
import { Lock } from 'lucide-react';
import Button from './components/ui/Button';
import ProfileModal from './components/ProfileModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ACHIEVEMENTS } from './constants';
import BootSequence from './components/BootSequence';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCase, setSelectedCase] = useState<Challenge | null>(null);
  const [userStats, setUserStats] = useState<Stats>({ correct: 0, total: 0, points: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { addToast } = useToast();
  
  // Track achievements to avoid double popping toasts
  const unlockedRef = useRef<Set<string>>(new Set());

  // ADMIN CONFIGURATION
  // Added your email so you have admin access immediately upon signup
  const ADMIN_EMAILS = ['admin@cyberhack.com', 'joshipushkar675@gmail.com'];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userObj: User = {
            id: user.id,
            username: user.user_metadata.username || user.email?.split('@')[0] || 'Unknown',
            email: user.email || '',
            isAdmin: ADMIN_EMAILS.includes(user.email || '')
          };
          setCurrentUser(userObj);
          
          // Async fetch stats
          const stats = await getUserStats(user.id);
          setUserStats(stats);
          
          // Initialize unlocked achievements
          ACHIEVEMENTS.forEach(ach => {
             if (ach.condition(stats)) unlockedRef.current.add(ach.id);
          });
          
          // Note: Welcome toast will fire after boot sequence
          setTimeout(() => {
             addToast(`Welcome back, Agent ${userObj.username}`, 'info');
          }, 4500);

          if (currentPage === 'login' || currentPage === 'signup') {
            setCurrentPage('cases');
          }
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Check for new achievements whenever stats change
  useEffect(() => {
    if (!currentUser) return;
    
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedRef.current.has(ach.id) && ach.condition(userStats)) {
        unlockedRef.current.add(ach.id);
        addToast(`Achievement Unlocked: ${ach.title}`, 'achievement');
      }
    });
  }, [userStats, currentUser, addToast]);

  const handleLogin = async (user: User) => {
    const userWithRole = { ...user, isAdmin: ADMIN_EMAILS.includes(user.email) };
    setCurrentUser(userWithRole);
    
    const stats = await getUserStats(user.id);
    setUserStats(stats);
    
    addToast('Authentication Successful. Access Granted.', 'success');
    
    if (userWithRole.isAdmin) {
      setCurrentPage('leaderboard');
    } else {
      setCurrentPage('cases');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserStats({ correct: 0, total: 0, points: 0 });
    setCurrentPage('home');
    setSelectedCase(null);
    unlockedRef.current.clear();
    addToast('Session Terminated.', 'info');
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    if (page !== 'case-detail') {
      setSelectedCase(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCase = (challenge: Challenge) => {
    setSelectedCase(challenge);
    setCurrentPage('case-detail');
  };

  // Render Boot Sequence until both animation is done AND data is loaded
  if (isBooting || isLoading) {
    return <BootSequence onComplete={() => setIsBooting(false)} isDataReady={!isLoading} />;
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col">
      <MatrixBackground />
      
      <Navbar 
        currentPage={currentPage}
        onNavigate={navigateTo}
        userStats={userStats}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
        username={currentUser?.username}
        isAdmin={currentUser?.isAdmin}
        onOpenProfile={() => setIsProfileOpen(true)}
        isLiveMode={isRealBackend()}
      />

      {currentUser && (
        <AnimatePresence>
          {isProfileOpen && (
            <ProfileModal 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)}
              user={currentUser}
              stats={userStats}
            />
          )}
        </AnimatePresence>
      )}

      <main className="flex-grow pt-20 px-4 pb-12 w-full max-w-7xl mx-auto z-10">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <HomePage key="home" onNavigate={navigateTo} />
          )}
          
          {(currentPage === 'login' || currentPage === 'signup') && (
            <AuthPage 
              key="auth" 
              mode={currentPage as 'login' | 'signup'} 
              onLogin={handleLogin}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'cases' && (
            <ChallengesPage 
              key="cases" 
              currentUser={currentUser} 
              onSelectCase={handleSelectCase} 
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'case-detail' && selectedCase && (
            <ChallengeDetailPage 
              key="case-detail"
              challenge={selectedCase}
              currentUser={currentUser}
              onBack={() => navigateTo('cases')}
              onUpdateStats={(newStats) => setUserStats(newStats)}
            />
          )}

          {currentPage === 'leaderboard' && (
            currentUser?.isAdmin ? (
              <LeaderboardPage 
                key="leaderboard" 
                currentUser={currentUser}
                onNavigate={navigateTo} 
              />
            ) : (
              <div key="access-denied" className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                  <Lock className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4">RESTRICTED AREA</h2>
                <p className="text-slate-400 mb-8 max-w-md text-lg">
                  Level 5 Security Clearance Required.<br/>
                  This file is accessible to Administrators only.
                </p>
                <Button onClick={() => navigateTo('cases')}>Return to Operations</Button>
              </div>
            )
          )}

          {currentPage === 'team' && (
            <TeamPage key="team" />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm z-10 border-t border-slate-900/50 bg-black/40 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} CyberHack Platform. All systems operational.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}