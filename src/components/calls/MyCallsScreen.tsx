import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useStockData } from '@/hooks/useStockData';
import { playlists } from '@/data/playlists';

const SP500_BENCHMARK_YTD = 17.54; // VOO approximate YTD

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

function getStatus(prediction: PredictionType, vsSP: number | null): { label: string; color: string } {
  if (vsSP === null) return { label: 'Loading', color: 'text-muted-foreground' };
  
  const isOnTrack = 
    (prediction === 'outperform' && vsSP > 0) ||
    (prediction === 'underperform' && vsSP < 0) ||
    (prediction === 'match' && Math.abs(vsSP) <= 2);
  
  return isOnTrack 
    ? { label: 'On track', color: 'text-emerald-400' }
    : { label: 'Behind', color: 'text-amber-400' };
}

export function MyCallsScreen() {
  const { setCurrentScreen, setSelectedPlaylist } = useApp();
  const { predictions } = usePredictions();
  
  // Get all tickers from playlists that have predictions
  const allTickers = useMemo(() => {
    const tickerSet = new Set<string>();
    predictions.forEach(pred => {
      const playlist = playlists.find(p => p.id === pred.playlist_id);
      if (playlist) {
        playlist.stocks.forEach(stock => {
          if (!stock.isPrivate) {
            tickerSet.add(stock.ticker);
          }
        });
      }
    });
    return Array.from(tickerSet);
  }, [predictions]);

  const { data: stockData } = useStockData(allTickers);

  // Calculate theme performance (average YTD of all stocks)
  const getThemePerformance = (playlistId: string): number | null => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return null;

    const ytdValues: number[] = [];
    playlist.stocks.forEach(stock => {
      if (!stock.isPrivate) {
        const quote = stockData[stock.ticker];
        if (quote?.ytdChange != null) {
          ytdValues.push(quote.ytdChange);
        }
      }
    });

    if (ytdValues.length === 0) return null;
    return ytdValues.reduce((a, b) => a + b, 0) / ytdValues.length;
  };

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
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-4">My Calls</h1>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Active:</span>
            <span className="text-sm font-semibold text-foreground">{predictions.length}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Accuracy:</span>
            <span className="text-sm font-semibold text-foreground">-</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Streak:</span>
            <span className="text-sm font-semibold text-foreground">{streak} days</span>
          </div>
        </div>

        {/* Predictions List */}
        <div className="space-y-3">
          {predictions.map((pred, index) => {
            const playlist = playlists.find(p => p.id === pred.playlist_id);
            if (!playlist) return null;

            const performance = getThemePerformance(pred.playlist_id);
            const vsSP = performance !== null ? performance - SP500_BENCHMARK_YTD : null;
            const daysLeft = getDaysRemaining(pred.expires_at);
            const status = getStatus(pred.prediction as PredictionType, vsSP);

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

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {performance !== null ? (
                      <span>
                        <span className={performance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {performance >= 0 ? '+' : ''}{performance.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground"> vs </span>
                        <span className={SP500_BENCHMARK_YTD >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          +{SP500_BENCHMARK_YTD.toFixed(1)}%
                        </span>
                      </span>
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{daysLeft} days left</span>
                    <span className={status.color}>{status.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
