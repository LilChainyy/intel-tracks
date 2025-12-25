import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
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

function getPredictionIcon(prediction: PredictionType) {
  switch (prediction) {
    case 'outperform': return TrendingUp;
    case 'match': return Minus;
    case 'underperform': return TrendingDown;
  }
}

function getPredictionColor(prediction: PredictionType) {
  switch (prediction) {
    case 'outperform': return 'text-emerald-400 bg-emerald-400/10';
    case 'match': return 'text-amber-400 bg-amber-400/10';
    case 'underperform': return 'text-rose-400 bg-rose-400/10';
  }
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

  // Determine actual performance relative to S&P
  const getActualResult = (performance: number | null): PredictionType | null => {
    if (performance === null) return null;
    const diff = performance - SP500_BENCHMARK_YTD;
    if (diff > 2) return 'outperform';
    if (diff < -2) return 'underperform';
    return 'match';
  };

  // Calculate accuracy
  const accuracyStats = useMemo(() => {
    let correct = 0;
    let total = 0;

    predictions.forEach(pred => {
      const performance = getThemePerformance(pred.playlist_id);
      const actualResult = getActualResult(performance);
      if (actualResult) {
        total++;
        if (pred.prediction === actualResult) {
          correct++;
        }
      }
    });

    return { correct, total };
  }, [predictions, stockData]);

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

  if (predictions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Calls</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">Track your predictions</p>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No predictions yet</h3>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              Make predictions on investment themes to track your accuracy here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Calls</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Track your predictions</p>

        {/* Predictions List */}
        <div className="space-y-3 mb-8">
          {predictions.map((pred, index) => {
            const playlist = playlists.find(p => p.id === pred.playlist_id);
            if (!playlist) return null;

            const performance = getThemePerformance(pred.playlist_id);
            const vsSP = performance !== null ? performance - SP500_BENCHMARK_YTD : null;
            const Icon = getPredictionIcon(pred.prediction as PredictionType);

            return (
              <motion.div
                key={pred.id || pred.playlist_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleThemeClick(pred.playlist_id)}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  {/* Theme Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={playlist.heroImage} 
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{playlist.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Prediction Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPredictionColor(pred.prediction as PredictionType)}`}>
                        <Icon className="w-3 h-3" />
                        {getPredictionLabel(pred.prediction as PredictionType)}
                      </span>
                    </div>
                  </div>

                  {/* Performance vs S&P */}
                  <div className="text-right">
                    {vsSP !== null ? (
                      <>
                        <p className={`text-sm font-semibold ${vsSP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {vsSP >= 0 ? '+' : ''}{vsSP.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">vs S&P</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-around">
            {/* Accuracy */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-lg font-bold text-foreground">
                  {accuracyStats.correct}/{accuracyStats.total}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-border" />

            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-lg font-bold text-foreground">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
