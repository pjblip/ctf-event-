import { createClient } from '@supabase/supabase-js';

// Access environment variables safely
// We use a fallback object {} because import.meta.env might be undefined in some environments
const env = (import.meta as any).env || {};

// LIVE CREDENTIALS
// We fallback to empty strings. If these are empty, we use the Mock implementation.
// To use a real backend, provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

// ------------------------------------------------------------------
// MOCK IMPLEMENTATION (Fallback if no backend configured)
// ------------------------------------------------------------------
const STORAGE_KEY = 'cyberhack_mock_session';

const getMockSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setMockSession = (user: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const clearMockSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const mockSupabase = {
  auth: {
    getUser: async () => {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = getMockSession();
      return { data: { user }, error: null };
    },
    
    signUp: async ({ email, password, options }: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!email || !password) {
        return { data: { user: null }, error: { message: "Email and password are required." } };
      }

      const id = 'user_' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        id,
        email,
        user_metadata: { ...options?.data },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      
      setMockSession(newUser);
      return { data: { user: newUser }, error: null };
    },

    signInWithPassword: async ({ email, password }: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!email || !password) {
        return { data: { user: null }, error: { message: "Invalid credentials." } };
      }

      // In mock mode, we accept any password but persist the session
      let user = getMockSession();
      
      // If no session or different email, create new deterministic user for this email
      if (!user || user.email !== email) {
        user = {
          id: 'user_' + btoa(email).substr(0, 10),
          email,
          user_metadata: { username: email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
      }
      
      setMockSession(user);
      return { data: { user }, error: null };
    },

    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      clearMockSession();
      return { error: null };
    }
  }
};

// ------------------------------------------------------------------
// EXPORT CLIENT
// ------------------------------------------------------------------

// Determine if we have real credentials
const hasRealCredentials = !!(supabaseUrl && supabaseKey);

// If using real credentials, create the real client. Otherwise use mock.
export const supabase: any = hasRealCredentials
  ? createClient(supabaseUrl, supabaseKey)
  : mockSupabase;

export const isRealBackend = () => hasRealCredentials;