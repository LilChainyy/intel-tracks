import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type PredictionType = 'outperform' | 'match' | 'underperform';

interface Prediction {
  id: string;
  playlist_id: string;
  prediction: PredictionType;
  created_at: string;
  expires_at: string;
}

const LOCAL_STORAGE_KEY = 'theme_predictions';

// Helper functions for localStorage
const getLocalPredictions = (): Prediction[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalPredictions = (predictions: Prediction[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(predictions));
};

export function usePredictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch predictions - from Supabase if logged in, localStorage otherwise
  const fetchPredictions = useCallback(async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('theme_predictions')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching predictions:', error);
          return;
        }

        setPredictions(data as Prediction[]);
      } catch (err) {
        console.error('Error fetching predictions:', err);
      }
    } else {
      // Use localStorage for anonymous users
      setPredictions(getLocalPredictions());
    }
  }, [user]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Get prediction for a specific playlist
  const getPrediction = useCallback((playlistId: string): Prediction | undefined => {
    return predictions.find(p => p.playlist_id === playlistId);
  }, [predictions]);

  // Check if user has made a prediction for a playlist
  const hasPrediction = useCallback((playlistId: string): boolean => {
    return predictions.some(p => p.playlist_id === playlistId);
  }, [predictions]);

  // Save or update a prediction
  const savePrediction = useCallback(async (
    playlistId: string, 
    prediction: PredictionType
  ): Promise<boolean> => {
    setIsLoading(true);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    try {
      if (user) {
        // Save to Supabase for authenticated users
        const { error } = await supabase
          .from('theme_predictions')
          .upsert({
            user_id: user.id,
            playlist_id: playlistId,
            prediction,
            expires_at: expiresAt.toISOString(),
          }, {
            onConflict: 'user_id,playlist_id'
          });

        if (error) {
          console.error('Error saving prediction:', error);
          return false;
        }
      } else {
        // Save to localStorage for anonymous users
        const localPredictions = getLocalPredictions();
        const existingIndex = localPredictions.findIndex(p => p.playlist_id === playlistId);
        
        const newPrediction: Prediction = {
          id: `local_${playlistId}_${Date.now()}`,
          playlist_id: playlistId,
          prediction,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        };

        if (existingIndex >= 0) {
          localPredictions[existingIndex] = newPrediction;
        } else {
          localPredictions.push(newPrediction);
        }
        
        saveLocalPredictions(localPredictions);
      }

      // Refresh predictions
      await fetchPredictions();
      return true;
    } catch (err) {
      console.error('Error saving prediction:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPredictions]);

  return {
    predictions,
    isLoading,
    getPrediction,
    hasPrediction,
    savePrediction,
  };
}
