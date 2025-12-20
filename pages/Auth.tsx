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
            data: { username: username || email.split('@')[0], points: 0 }
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
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

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