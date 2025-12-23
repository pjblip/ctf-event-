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
            } else if (error) {
                console.error("Error fetching challenges from DB:", JSON.stringify(error));
            }
        } catch (e) {
            console.error("Error fetching challenges:", e);
        }
        // Fallback if DB fetch fails
        return MOCK_CASES;
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
            } else if (error) {
                console.warn("Error fetching solve counts:", JSON.stringify(error));
            }
        } catch (e) {
            console.error("Error fetching solve counts", e);
        }
    }
    return counts;
};

export const verifyFlag = async (challengeId: string, userGuess: string, mockFlag?: string): Promise<boolean> => {
    // 1. Try Backend RPC if configured
    if (isRealBackend()) {
        try {
            // Attempt RPC call
            const { data, error } = await supabase.rpc('submit_flag', {
                p_challenge_id: challengeId,
                p_guess: userGuess
            });
            
            // If successful, return the result
            if (!error) {
                return !!data;
            }
            
            // If error (e.g. function missing, network error), log it and fall through to local check
            console.warn("RPC Error (falling back to local check):", JSON.stringify(error, null, 2));
        } catch (e) {
            console.error("RPC Exception:", e);
        }
    } 

    // 2. Fallback / Mock Mode: Check against local data
    
    // Check provided mockFlag (from getChallenges result if it was a local fetch)
    if (mockFlag && userGuess === mockFlag) return true;

    // Check MOCK_CASES constants (fallback for when DB fetch worked but RPC failed)
    const localChallenge = MOCK_CASES.find(c => c.id === challengeId);
    if (localChallenge && localChallenge.flag === userGuess) {
        return true;
    }

    return false;
};

// ----------------------------------------------------------------------
// STATS & PROFILE
// ----------------------------------------------------------------------

export const getUserStats = async (userId: string): Promise<Stats> => {
    // 1. Try Local Storage first for immediate UI feedback (Optimistic)
    // Set default points to 250 for new users
    let stats: Stats = { correct: 0, total: 0, points: 250 };
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
                    points: data.points !== undefined ? data.points : 250 // Fallback to 250 if undefined
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
        try {
            await supabase
                .from('profiles')
                .update({ 
                    points: stats.points, 
                    solved_count: stats.correct 
                })
                .eq('id', userId);
        } catch (e) {
            console.error("Error saving stats:", e);
        }
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
        try {
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
        } catch (e) {
            console.error("Error fetching solved cases:", e);
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
        try {
            await supabase
                .from('solves')
                .insert({ user_id: userId, challenge_id: caseId })
                .select(); 
        } catch (e) {
            console.error("Error saving solve:", e);
        }
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
        try {
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
        } catch (e) {
            console.error("Error fetching hints:", e);
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
        try {
            await supabase
                .from('unlocked_hints')
                .insert({ user_id: userId, challenge_id: challengeId });
        } catch (e) {
            console.error("Error saving hint:", e);
        }
    }
};