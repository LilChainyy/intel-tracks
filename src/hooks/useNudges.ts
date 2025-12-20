import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Nudge {
  id: string;
  nudge_type: string;
  message: string;
  related_ticker: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

interface ActivityStats {
  stockViewsThisWeek: number;
  externalLinksThisWeek: number;
  savedStocksCount: number;
  lastActive: string | null;
}

interface UseNudgesReturn {
  nudges: Nudge[];
  stats: ActivityStats | null;
  isLoading: boolean;
  dismissNudge: (nudgeId: string) => Promise<void>;
  markAsRead: (nudgeId: string) => Promise<void>;
}

export function useNudges(): UseNudgesReturn {
  const { user } = useAuth();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNudges = useCallback(async () => {
    if (!user) {
      setNudges([]);
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch active nudges
      const { data: nudgeData } = await supabase
        .from('user_nudges')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setNudges((nudgeData as Nudge[]) || []);

      // Calculate activity stats from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: activityData } = await supabase
        .from('user_activity')
        .select('action_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      if (activityData) {
        const stockViews = activityData.filter(a => a.action_type === 'view_stock').length;
        const externalLinks = activityData.filter(a => a.action_type === 'external_link').length;
        const lastActive = activityData.length > 0 
          ? activityData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        // Get saved stocks count (rough estimate from activity)
        const saveActions = activityData.filter(a => a.action_type === 'save_stock').length;
        const unsaveActions = activityData.filter(a => a.action_type === 'unsave_stock').length;

        setStats({
          stockViewsThisWeek: stockViews,
          externalLinksThisWeek: externalLinks,
          savedStocksCount: Math.max(0, saveActions - unsaveActions),
          lastActive,
        });
      }
    } catch (err) {
      console.error('Error fetching nudges:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNudges();
  }, [fetchNudges]);

  const dismissNudge = useCallback(async (nudgeId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_nudges')
        .update({ is_dismissed: true })
        .eq('id', nudgeId)
        .eq('user_id', user.id);

      setNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (err) {
      console.error('Error dismissing nudge:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (nudgeId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_nudges')
        .update({ is_read: true })
        .eq('id', nudgeId)
        .eq('user_id', user.id);

      setNudges(prev => prev.map(n => n.id === nudgeId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking nudge as read:', err);
    }
  }, [user]);

  return { nudges, stats, isLoading, dismissNudge, markAsRead };
}
