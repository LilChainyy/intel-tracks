import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface EdgeProfile {
  totalEdge: number;
  patternRecognition: number;
  timing: number;
  calibration: number;
  callsMade: number;
  correctCalls: number;
  archetype: string | null;
  accuracy: number;
}

interface EdgeHistoryItem {
  id: string;
  playlistId: string;
  playlistTitle: string;
  edgeEarned: number;
  isCorrect: boolean;
  createdAt: string;
}

const LOCAL_EDGE_KEY = 'user_edge_profile';
const LOCAL_HISTORY_KEY = 'user_edge_history';

function getDefaultProfile(): EdgeProfile {
  return {
    totalEdge: 0,
    patternRecognition: 50,
    timing: 50,
    calibration: 50,
    callsMade: 0,
    correctCalls: 0,
    archetype: null,
    accuracy: 0,
  };
}

function calculateArchetype(profile: EdgeProfile): { name: string; description: string } {
  const { patternRecognition, timing, calibration } = profile;
  
  // Find the top two scores
  const scores = [
    { name: 'Pattern', value: patternRecognition },
    { name: 'Timing', value: timing },
    { name: 'Calibration', value: calibration },
  ].sort((a, b) => b.value - a.value);

  const primary = scores[0].name;
  const secondary = scores[1].name;
  
  // Find the weakness
  const weakness = scores[2];

  // Generate archetype name
  const archetypeMap: Record<string, string> = {
    'Pattern-Calibration': 'Connector-Calibrator',
    'Pattern-Timing': 'Pattern Sniper',
    'Calibration-Pattern': 'Connector-Calibrator',
    'Calibration-Timing': 'Steady Hand',
    'Timing-Pattern': 'Pattern Sniper',
    'Timing-Calibration': 'Steady Hand',
  };

  const archetypeName = archetypeMap[`${primary}-${secondary}`] || 'Balanced Investor';

  // Generate description based on archetype
  const descriptions: Record<string, string> = {
    'Connector-Calibrator': `You spot patterns others miss. Your confidence matches your accuracy. Work on your timing — you tend to be ${timing < 50 ? 'early' : 'reactive'}.`,
    'Pattern Sniper': `You see connections and act on them decisively. Your pattern recognition is strong. Focus on calibrating your conviction levels.`,
    'Steady Hand': `You time your moves well and your confidence is well-calibrated. Look for more connecting signals to strengthen your thesis building.`,
    'Balanced Investor': `You have a balanced approach across all dimensions. Continue developing your unique edge.`,
  };

  return {
    name: archetypeName,
    description: descriptions[archetypeName] || descriptions['Balanced Investor'],
  };
}

export function useEdgeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EdgeProfile>(getDefaultProfile());
  const [history, setHistory] = useState<EdgeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile from Supabase or localStorage
  const fetchProfile = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_edge')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching edge profile:', error);
          return;
        }

        if (data) {
          const fetchedProfile: EdgeProfile = {
            totalEdge: data.total_edge,
            patternRecognition: data.pattern_recognition,
            timing: data.timing,
            calibration: data.calibration,
            callsMade: data.calls_made,
            correctCalls: data.correct_calls,
            archetype: data.archetype,
            accuracy: data.calls_made > 0 
              ? Math.round((data.correct_calls / data.calls_made) * 100) 
              : 0,
          };
          setProfile(fetchedProfile);
        }
      } catch (err) {
        console.error('Error fetching edge profile:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use localStorage for anonymous users
      try {
        const stored = localStorage.getItem(LOCAL_EDGE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch {
        // Use default
      }
    }
  }, [user]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('theme_predictions')
          .select('id, playlist_id, edge_earned, is_correct, created_at')
          .eq('user_id', user.id)
          .eq('is_scored', true)
          .order('scored_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching edge history:', error);
          return;
        }

        if (data) {
          const historyItems: EdgeHistoryItem[] = data.map(item => ({
            id: item.id,
            playlistId: item.playlist_id,
            playlistTitle: item.playlist_id, // Will be resolved to title in component
            edgeEarned: item.edge_earned || 0,
            isCorrect: item.is_correct || false,
            createdAt: item.created_at,
          }));
          setHistory(historyItems);
        }
      } catch (err) {
        console.error('Error fetching edge history:', err);
      }
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch {
        // Use empty
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, [fetchProfile, fetchHistory]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<EdgeProfile>) => {
    const newProfile = { ...profile, ...updates };
    
    // Recalculate accuracy
    if (newProfile.callsMade > 0) {
      newProfile.accuracy = Math.round((newProfile.correctCalls / newProfile.callsMade) * 100);
    }

    setProfile(newProfile);

    if (user) {
      try {
        await supabase
          .from('user_edge')
          .upsert({
            user_id: user.id,
            total_edge: newProfile.totalEdge,
            pattern_recognition: newProfile.patternRecognition,
            timing: newProfile.timing,
            calibration: newProfile.calibration,
            calls_made: newProfile.callsMade,
            correct_calls: newProfile.correctCalls,
            archetype: newProfile.archetype,
          }, {
            onConflict: 'user_id',
          });
      } catch (err) {
        console.error('Error updating edge profile:', err);
      }
    } else {
      localStorage.setItem(LOCAL_EDGE_KEY, JSON.stringify(newProfile));
    }
  }, [user, profile]);

  const archetype = calculateArchetype(profile);

  return {
    profile,
    history,
    archetype,
    isLoading,
    updateProfile,
    refetch: () => {
      fetchProfile();
      fetchHistory();
    },
  };
}
