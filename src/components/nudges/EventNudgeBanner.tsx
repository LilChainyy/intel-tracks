import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertTriangle, Bell, TrendingUp } from 'lucide-react';
import { useNudges } from '@/hooks/useNudges';
import { useAuth } from '@/context/AuthContext';

const nudgeTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  upcoming_event: { icon: <Calendar className="w-4 h-4" />, color: 'text-blue-500' },
  overtrading_warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-500' },
  inactivity_reminder: { icon: <Bell className="w-4 h-4" />, color: 'text-muted-foreground' },
  saved_stock_event: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-500' },
};

export function EventNudgeBanner() {
  const { user } = useAuth();
  const { nudges, dismissNudge } = useNudges();

  // Only show for logged-in users with active nudges
  if (!user || nudges.length === 0) return null;

  // Show only the most recent unread nudge
  const activeNudge = nudges.find(n => !n.is_read) || nudges[0];
  if (!activeNudge) return null;

  const config = nudgeTypeConfig[activeNudge.nudge_type] || nudgeTypeConfig.upcoming_event;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="mx-6 mb-4"
      >
        <div className="card-surface p-3 bg-gradient-to-r from-secondary/80 to-secondary/50">
          <div className="flex items-start gap-3">
            <span className={config.color}>{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">
                {activeNudge.message}
              </p>
              {activeNudge.related_ticker && (
                <span className="text-xs text-muted-foreground mt-1">
                  Related: {activeNudge.related_ticker}
                </span>
              )}
            </div>
            <button
              onClick={() => dismissNudge(activeNudge.id)}
              className="p-1 rounded hover:bg-background/50 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
