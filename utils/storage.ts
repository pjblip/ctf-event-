import { supabase, isRealBackend } from '../services/supabase';
import { Stats, Challenge } from '../types';
import { MOCK_CASES } from '../constants';

// ----------------------------------------------------------------------
// CHALLENGE DATA
// ----------------------------------------------------------------------

export const getChallenges = async (): Promise<Challenge[]> => {
    if (isRealBackend()) {
        try {
            // We do NOT fetch the 'flag' column here for security
            // Users must guess it via RPC
            const { data, error } = await supabase
                .from('challenges')
                .select('id, title, description, difficulty, points, hint, estimated_time, duration, file_url');
            
            if (data && !error) {
                // Map DB columns to our Typescript interface
                return data.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    difficulty: c.difficulty,
                    points: c.points,
                    hint: c.hint,
                    estimatedTime: c.estimated_time,
                    duration: c.duration,
                    fileUrl: c.file_url,
                    flag: '' // Empty, as we don't know it client-side
                }));
            }
        } catch (e) {
            console.error("Error fetching challenges:", e);
        }
        return MOCK_CASES; // Fallback if DB fetch fails but URL is set
    }
    return MOCK_CASES;
};

export const getChallengeSolveCounts = async (): Promise<Record<string, number>> => {
    const counts: Record<string, number> = {};
    
    if (isRealBackend()) {
        try {
            // Get all solves
            const { data, error } = await supabase
                .from('solves')
                .select('challenge_id');
            
            if (data && !error) {
                data.forEach((solve: any) => {
                    counts[solve.challenge_id] = (counts[solve.challenge_id] || 0) + 1;
                });
            }
        } catch (e) {
            console.error("Error fetching solve counts", e);
        }
    }
    return counts;
};

export const verifyFlag = async (challengeId: string, userGuess: string, mockFlag?: string): Promise<boolean> => {
    if (isRealBackend()) {
        // SECURE: Call Backend RPC function
        try {
            const { data, error } = await supabase.rpc('submit_flag', {
                p_challenge_id: challengeId,
                p_guess: userGuess
            });
            
            if (error) {
                console.error("RPC Error:", error);
                return false;
            }
            return !!data;
        } catch (e) {
            console.error(e);
            return false;
        }
    } else {
        // INSECURE: Mock Mode (Client-side check)
        return userGuess === mockFlag;
    }
};

// ----------------------------------------------------------------------
// STATS & PROFILE
// ----------------------------------------------------------------------

export const getUserStats = async (userId: string): Promise<Stats> => {
    // 1. Try Local Storage first for immediate UI feedback (Optimistic)
    let stats: Stats = { correct: 0, total: 0, points: 0 };
    try {
        const stored = localStorage.getItem(`stats_${userId}`);
        if (stored) stats = JSON.parse(stored);
    } catch (e) {
        console.warn("Local storage error", e);
    }

    // 2. If Real Backend, fetch truth from DB
    if (isRealBackend()) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('points, solved_count')
                .eq('id', userId)
                .single();
            
            if (data && !error) {
                const dbStats = {
                    correct: data.solved_count || 0,
                    total: data.solved_count || 0, // Simplified for this event
                    points: data.points || 0
                };
                // Sync back to local storage
                localStorage.setItem(`stats_${userId}`, JSON.stringify(dbStats));
                return dbStats;
            }
        } catch (err) {
            console.error("DB Fetch Error:", err);
        }
    }

    return stats;
};

export const saveStats = async (userId: string, stats: Stats) => {
    // 1. Save locally
    try {
        localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));
    } catch (e) { console.error(e); }

    // 2. Save to DB
    if (isRealBackend()) {
        await supabase
            .from('profiles')
            .update({ 
                points: stats.points, 
                solved_count: stats.correct 
            })
            .eq('id', userId);
    }
};

// ----------------------------------------------------------------------
// SOLVED CASES
// ----------------------------------------------------------------------

export const getSolvedCases = async (userId: string): Promise<string[]> => {
    let localSolved: string[] = [];
    try {
        const stored = localStorage.getItem(`solved_${userId}`);
        if (stored) localSolved = JSON.parse(stored);
    } catch {}

    if (isRealBackend()) {
        const { data } = await supabase
            .from('solves')
            .select('challenge_id')
            .eq('user_id', userId);
        
        if (data) {
            const dbSolved = data.map((s: any) => s.challenge_id);
            // Merge arrays uniquely
            const merged = Array.from(new Set([...localSolved, ...dbSolved]));
            localStorage.setItem(`solved_${userId}`, JSON.stringify(merged));
            return merged;
        }
    }
    return localSolved;
};

export const saveSolvedCase = async (userId: string, caseId: string) => {
    // Local
    const current = await getSolvedCases(userId);
    if (!current.includes(caseId)) {
        current.push(caseId);
        localStorage.setItem(`solved_${userId}`, JSON.stringify(current));
    }

    // DB
    if (isRealBackend()) {
        await supabase
            .from('solves')
            .insert({ user_id: userId, challenge_id: caseId })
            .select(); 
    }
};

// ----------------------------------------------------------------------
// HINTS
// ----------------------------------------------------------------------

export const getUnlockedHints = async (userId: string): Promise<string[]> => {
    let localHints: string[] = [];
    try {
        const stored = localStorage.getItem(`hints_${userId}`);
        if (stored) localHints = JSON.parse(stored);
    } catch {}

    if (isRealBackend()) {
        const { data } = await supabase
            .from('unlocked_hints')
            .select('challenge_id')
            .eq('user_id', userId);
        
        if (data) {
            const dbHints = data.map((h: any) => h.challenge_id);
            const merged = Array.from(new Set([...localHints, ...dbHints]));
            localStorage.setItem(`hints_${userId}`, JSON.stringify(merged));
            return merged;
        }
    }
    return localHints;
};

export const saveUnlockedHint = async (userId: string, challengeId: string) => {
    // Local
    const current = await getUnlockedHints(userId);
    if (!current.includes(challengeId)) {
        current.push(challengeId);
        localStorage.setItem(`hints_${userId}`, JSON.stringify(current));
    }

    // DB
    if (isRealBackend()) {
        await supabase
            .from('unlocked_hints')
            .insert({ user_id: userId, challenge_id: challengeId });
    }
};