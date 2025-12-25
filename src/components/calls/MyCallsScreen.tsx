import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronRight, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { playlists } from '@/data/playlists';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

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

function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d');
}

export function MyCallsScreen() {
  const { setCurrentScreen, setSelectedPlaylist } = useApp();
  const { predictions } = usePredictions();

  // Calculate streak (consecutive days with predictions)
  const streak = useMemo(() => {
    if (predictions.length === 0) return 0;
    
    const sortedDates = predictions
      .map(p => new Date(p.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }, [predictions]);

  const handleThemeClick = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentScreen('playlist');
    }
  };

  const handleExploreClick = () => {
    setCurrentScreen('discovery');
  };

  if (predictions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-8">My Calls</h1>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-[280px]">
              No calls yet. Explore themes and make your first prediction.
            </p>
            <button
              onClick={handleExploreClick}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90"
            >
              Explore Themes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6">
        {/* Header with Scorecard button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">My Calls</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentScreen('scorecard')}
            className="gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Weekly Scorecard
          </Button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Active:</span>
            <span className="text-sm font-semibold text-foreground">{predictions.length}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Accuracy:</span>
            <span className="text-sm font-semibold text-muted-foreground">-</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Streak:</span>
            <span className="text-sm font-semibold text-foreground">{streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {/* Predictions List */}
        <div className="space-y-3">
          {predictions.map((pred, index) => {
            const playlist = playlists.find(p => p.id === pred.playlist_id);
            if (!playlist) return null;

            const daysLeft = getDaysRemaining(pred.expires_at);
            const calledDate = formatDate(pred.created_at);
            const scoresDate = formatDate(pred.expires_at);

            return (
              <motion.div
                key={pred.id || pred.playlist_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleThemeClick(pred.playlist_id)}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground pr-2">{playlist.title}</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPredictionColor(pred.prediction as PredictionType)}`}>
                    {getPredictionLabel(pred.prediction as PredictionType)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>Called: {calledDate}</span>
                    <span>Scores: {scoresDate}</span>
                  </div>
                  <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
