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

export function usePredictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all predictions for the current user
  const fetchPredictions = useCallback(async () => {
    if (!user) return;

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
    if (!user) return false;

    setIsLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

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
