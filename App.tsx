import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import CursorEffect from './components/CursorEffect';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCase, setSelectedCase] = useState<Challenge | null>(null);
  // Default to 250 points
  const [userStats, setUserStats] = useState<Stats>({ correct: 0, total: 0, points: 250 });
  const [isLoading, setIsLoading] = useState(true);
  
  // UX: Only run boot sequence once per session
  const [isBooting, setIsBooting] = useState(() => {
    return !sessionStorage.getItem('cyberhack_booted');
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { addToast } = useToast();
  
  // Track achievements to avoid double popping toasts
  const unlockedRef = useRef<Set<string>>(new Set());

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
          
          const stats = await getUserStats(user.id);
          setUserStats(stats);
          
          ACHIEVEMENTS.forEach(ach => {
             if (ach.condition(stats)) unlockedRef.current.add(ach.id);
          });
          
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
    setUserStats({ correct: 0, total: 0, points: 250 });
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

  const handleBootComplete = () => {
    sessionStorage.setItem('cyberhack_booted', 'true');
    setIsBooting(false);
  };

  if (isBooting) {
    // Determine data readiness. If loading takes longer than boot, wait. 
    // Usually loading is fast enough.
    return <BootSequence onComplete={handleBootComplete} isDataReady={!isLoading} />;
  }

  // Define Page Transition Variants
  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98, filter: 'blur(5px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -15, scale: 0.98, filter: 'blur(5px)' }
  };

  const pageTransition = { duration: 0.3, ease: "easeOut" };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col overflow-hidden">
      {/* GLOBAL SCREEN EFFECTS */}
      <div className="scanlines"></div>
      <div className="vignette"></div>
      <CursorEffect />

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
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <HomePage onNavigate={navigateTo} />
            </motion.div>
          )}
          
          {(currentPage === 'login' || currentPage === 'signup') && (
            <motion.div key="auth" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <AuthPage 
                mode={currentPage as 'login' | 'signup'} 
                onLogin={handleLogin}
                onNavigate={navigateTo}
              />
            </motion.div>
          )}

          {currentPage === 'cases' && (
            <motion.div key="cases" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <ChallengesPage 
                currentUser={currentUser} 
                onSelectCase={handleSelectCase} 
                onNavigate={navigateTo}
              />
            </motion.div>
          )}

          {currentPage === 'case-detail' && selectedCase && (
            <motion.div key="case-detail" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <ChallengeDetailPage 
                challenge={selectedCase}
                currentUser={currentUser}
                onBack={() => navigateTo('cases')}
                onUpdateStats={(newStats) => setUserStats(newStats)}
              />
            </motion.div>
          )}

          {currentPage === 'leaderboard' && (
            currentUser?.isAdmin ? (
              <motion.div key="leaderboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                <LeaderboardPage 
                  currentUser={currentUser}
                  onNavigate={navigateTo} 
                />
              </motion.div>
            ) : (
              <motion.div key="access-denied" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                  <Lock className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4">RESTRICTED AREA</h2>
                <p className="text-slate-400 mb-8 max-w-md text-lg">
                  Level 5 Security Clearance Required.<br/>
                  This file is accessible to Administrators only.
                </p>
                <Button onClick={() => navigateTo('cases')}>Return to Operations</Button>
              </motion.div>
            )
          )}

          {currentPage === 'team' && (
            <motion.div key="team" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <TeamPage />
            </motion.div>
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