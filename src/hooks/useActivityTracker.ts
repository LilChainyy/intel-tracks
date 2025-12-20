import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Json } from '@/integrations/supabase/types';

type ActionType = 'view_stock' | 'save_stock' | 'view_playlist' | 'external_link' | 'take_quiz' | 'unsave_stock';

interface TrackActivityParams {
  action: ActionType;
  ticker?: string;
  playlistId?: string;
  metadata?: Json;
}

export function useActivityTracker() {
  const { user } = useAuth();

  const trackActivity = useCallback(async ({ action, ticker, playlistId, metadata = {} }: TrackActivityParams) => {
    if (!user) return; // Only track for logged-in users

    try {
      const { error } = await supabase
        .from('user_activity')
        .insert([{
          user_id: user.id,
          action_type: action,
          ticker: ticker || null,
          playlist_id: playlistId || null,
          metadata,
        }]);

      if (error) {
        console.error('Error tracking activity:', error);
      }
    } catch (err) {
      console.error('Error tracking activity:', err);
    }
  }, [user]);

  const trackStockView = useCallback((ticker: string, playlistId?: string) => {
    trackActivity({ action: 'view_stock', ticker, playlistId });
  }, [trackActivity]);

  const trackStockSave = useCallback((ticker: string) => {
    trackActivity({ action: 'save_stock', ticker });
  }, [trackActivity]);

  const trackStockUnsave = useCallback((ticker: string) => {
    trackActivity({ action: 'unsave_stock', ticker });
  }, [trackActivity]);

  const trackPlaylistView = useCallback((playlistId: string) => {
    trackActivity({ action: 'view_playlist', playlistId });
  }, [trackActivity]);

  const trackExternalLink = useCallback((ticker: string, url: string) => {
    trackActivity({ action: 'external_link', ticker, metadata: { url } });
  }, [trackActivity]);

  const trackQuizTaken = useCallback(() => {
    trackActivity({ action: 'take_quiz' });
  }, [trackActivity]);

  return {
    trackActivity,
    trackStockView,
    trackStockSave,
    trackStockUnsave,
    trackPlaylistView,
    trackExternalLink,
    trackQuizTaken,
  };
}
