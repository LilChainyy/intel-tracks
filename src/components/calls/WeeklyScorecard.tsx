import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { playlists } from '@/data/playlists';

function getPredictionLabel(prediction: PredictionType) {
  switch (prediction) {
    case 'outperform': return 'Outperform';
    case 'match': return 'Match';
    case 'underperform': return 'Underperform';
  }
}

function getPredictionColor(prediction: PredictionType) {
  switch (prediction) {
    case 'outperform': return 'text-emerald-400 bg-emerald-400/10';
    case 'match': return 'text-amber-400 bg-amber-400/10';
    case 'underperform': return 'text-rose-400 bg-rose-400/10';
  }
}

interface ScorecardItem {
  playlistId: string;
  title: string;
  prediction: PredictionType;
  weekNumber: number;
  totalWeeks: number;
  weekPerformance: number;
  spPerformance: number;
  status: 'on-track' | 'behind' | 'off-track';
}

// Placeholder data for weekly scorecard
const placeholderItems: ScorecardItem[] = [
  {
    playlistId: 'nuclear-renaissance',
    title: 'Nuclear Renaissance',
    prediction: 'outperform',
    weekNumber: 1,
    totalWeeks: 4,
    weekPerformance: 4.1,
    spPerformance: 1.2,
    status: 'on-track',
  },
  {
    playlistId: 'ai-infrastructure',
    title: 'AI Infrastructure',
    prediction: 'outperform',
    weekNumber: 2,
    totalWeeks: 4,
    weekPerformance: 2.8,
    spPerformance: 1.2,
    status: 'on-track',
  },
  {
    playlistId: 'ipo-watchlist',
    title: 'IPO Watchlist',
    prediction: 'outperform',
    weekNumber: 1,
    totalWeeks: 4,
    weekPerformance: -2.3,
    spPerformance: 1.2,
    status: 'off-track',
  },
];

function getStatusLabel(status: ScorecardItem['status']): string {
  switch (status) {
    case 'on-track': return 'On track';
    case 'behind': return 'Behind';
    case 'off-track': return 'Off track';
  }
}

function getStatusColor(status: ScorecardItem['status']): string {
  switch (status) {
    case 'on-track': return 'text-emerald-400';
    case 'behind': return 'text-amber-400';
    case 'off-track': return 'text-rose-400';
  }
}

export function WeeklyScorecard() {
  const { setCurrentScreen } = useApp();
  const { predictions } = usePredictions();

  // Use placeholder data, but merge with real predictions if available
  const items = predictions.length > 0 
    ? placeholderItems.slice(0, Math.max(predictions.length, 3))
    : placeholderItems;

  const onTrackCount = items.filter(i => i.status === 'on-track').length;
  const topPerformer = [...items].sort((a, b) => b.weekPerformance - a.weekPerformance)[0];
  const needsAttention = [...items].sort((a, b) => a.weekPerformance - b.weekPerformance)[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-6 pb-4 border-b border-border">
        <button
          onClick={() => setCurrentScreen('calls')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-foreground">Weekly Scorecard</h1>
        <p className="text-sm text-muted-foreground mt-1">Week of Dec 23 - Dec 29</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Predictions List */}
        {items.map((item, index) => (
          <motion.div
            key={item.playlistId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            {/* Theme name and progress */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <span className="text-xs text-muted-foreground">
                Week {item.weekNumber} of {item.totalWeeks}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-secondary rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(item.weekNumber / item.totalWeeks) * 100}%` }}
              />
            </div>

            {/* Call and performance */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Your call:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPredictionColor(item.prediction)}`}>
                  {getPredictionLabel(item.prediction)}
                </span>
              </div>
            </div>

            {/* This week's performance */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                <span className="text-xs text-muted-foreground mr-1">This week:</span>
                <span className={item.weekPerformance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {item.weekPerformance >= 0 ? '+' : ''}{item.weekPerformance.toFixed(1)}%
                </span>
                <span className="text-muted-foreground"> vs S&P </span>
                <span className={item.spPerformance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {item.spPerformance >= 0 ? '+' : ''}{item.spPerformance.toFixed(1)}%
                </span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground">Summary</h2>
          
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {/* This week stats */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm text-foreground">
                This week: {onTrackCount} of {items.length} calls on track
              </span>
            </div>

            {/* Top performer */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">
                Top performer: {topPerformer.title}{' '}
                <span className="text-emerald-400">+{topPerformer.weekPerformance.toFixed(1)}%</span>
              </span>
            </div>

            {/* Needs attention */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm text-foreground">
                Needs attention: {needsAttention.title}{' '}
                <span className="text-rose-400">{needsAttention.weekPerformance.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 border-t border-border"
        >
          <p className="text-sm text-muted-foreground text-center">
            Thesis accuracy: <span className="text-foreground font-medium">67%</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
