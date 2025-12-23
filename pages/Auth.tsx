import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { User } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const MotionDiv = motion.div as any;

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    // Base requirement: 8 chars. If less, it's always weak (1).
    if (pass.length < 8) return 1;
    
    let score = 1;
    if (pass.length >= 12) score++; // Length bonus
    if (/[A-Z]/.test(pass)) score++; // Uppercase bonus
    if (/[0-9]/.test(pass)) score++; // Number bonus
    if (/[^A-Za-z0-9]/.test(pass)) score++; // Special char bonus
    
    return Math.min(score, 5); // Max score 5
  };

  const strength = getPasswordStrength(password);
  
  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    if (s === 2) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    if (s === 3) return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';
    if (s === 4) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
    return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'; // Max strength
  };

  const getStrengthLabel = (s: number) => {
     if (s <= 1) return 'WEAK';
     if (s === 2) return 'FAIR';
     if (s === 3) return 'GOOD';
     if (s === 4) return 'STRONG';
     return 'SECURE';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0], points: 250 }
          }
        });

        if (error) throw error;
        
        // Handle Email Confirmation Flow
        if (data.user && !data.session) {
           setSuccessMsg('Identity created successfully. Please check your email to confirm your account before logging in.');
           return;
        }

        if (data.user && data.session) {
           onLogin({
             id: data.user.id,
             username: username,
             email: data.user.email || ''
           });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onLogin({
            id: data.user.id,
            username: data.user.user_metadata.username || data.user.email?.split('@')[0],
            email: data.user.email || ''
          });
        }
      }
    } catch (err: any) {
      // Improved error message for the specific "Invalid login credentials" error
      if (err.message && err.message.includes("Invalid login credentials")) {
        setError("Invalid credentials. If this is a new database, please Sign Up first.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
           <Shield className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
           <h2 className="text-3xl font-bold text-white tracking-tight">
             {mode === 'login' ? 'System Login' : 'New Operative Registration'}
           </h2>
           <p className="text-slate-400 mt-2">Enter credentials to access the secure network.</p>
        </div>

        <Card className="border-t-4 border-t-cyan-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <Input 
                label="Username" 
                placeholder="Ex: ZeroCool" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="agent@cyberhack.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="space-y-2">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              
              {/* PASSWORD STRENGTH INDICATOR */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                   <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Security Level</span>
                      <span className={`text-[10px] font-bold font-mono tracking-wider transition-colors duration-300 ${
                          strength <= 1 ? 'text-red-400' :
                          strength === 2 ? 'text-orange-400' :
                          strength === 3 ? 'text-yellow-400' :
                          strength === 4 ? 'text-emerald-400' : 'text-cyan-400'
                      }`}>
                          [{getStrengthLabel(strength)}]
                      </span>
                   </div>
                   <div className="flex gap-1 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      {[1, 2, 3, 4, 5].map((level) => (
                         <div 
                           key={level}
                           className={`h-full rounded-full flex-1 transition-all duration-500 ${
                              strength >= level ? getStrengthColor(strength) : 'bg-slate-800 opacity-20'
                           }`}
                         />
                      ))}
                   </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 p-3 rounded flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (mode === 'login' ? 'AUTHENTICATE' : 'INITIATE REGISTRATION')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <>
                New to the system?{' '}
                <button onClick={() => onNavigate('signup')} className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">
                  Create Identity
                </button>
              </>
            ) : (
              <>
                Already authenticated?{' '}
                <button onClick={() => onNavigate('login')} className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">
                  Login Here
                </button>
              </>
            )}
          </div>
        </Card>
      </MotionDiv>
    </div>
  );
};

export default AuthPage;