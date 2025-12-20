import { motion } from 'framer-motion';
import { Activity, Eye, ExternalLink, Bookmark, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useNudges } from '@/hooks/useNudges';
import { useAuth } from '@/context/AuthContext';

export function ActivitySection() {
  const { user } = useAuth();
  const { stats, nudges, isLoading, dismissNudge } = useNudges();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Your Activity</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isOvertrading = stats && stats.externalLinksThisWeek > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Your Activity</span>
        <span className="text-xs text-muted-foreground">This week</span>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Stocks Viewed</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{stats.stockViewsThisWeek}</span>
          </div>

          <div className={`p-3 rounded-xl ${isOvertrading ? 'bg-amber-500/10' : 'bg-secondary/50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">External Checks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${isOvertrading ? 'text-amber-500' : 'text-foreground'}`}>
                {stats.externalLinksThisWeek}
              </span>
              {isOvertrading && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Saved Stocks</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{stats.savedStocksCount}</span>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Active</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {stats.lastActive 
                ? formatRelativeTime(new Date(stats.lastActive))
                : 'Just now'
              }
            </span>
          </div>
        </div>
      )}

      {/* Overtrading Warning */}
      {isOvertrading && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Heads up!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You've checked {stats?.externalLinksThisWeek} stocks externally this week. 
                Consider waiting for higher conviction before acting.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Nudges */}
      {nudges.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>Insights</span>
          </div>
          {nudges.slice(0, 2).map((nudge) => (
            <div 
              key={nudge.id}
              className="p-2 bg-secondary/30 rounded-lg flex items-center justify-between"
            >
              <p className="text-xs text-foreground">{nudge.message}</p>
              <button
                onClick={() => dismissNudge(nudge.id)}
                className="text-xs text-muted-foreground hover:text-foreground ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
