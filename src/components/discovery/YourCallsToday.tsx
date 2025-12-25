import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

type ViewUpdate = 'stronger' | 'same' | 'weaker';

// Placeholder data for today's performance
const placeholderData: Record<string, { themeChange: string; spChange: string; reason: string }> = {
  'nuclear-renaissance': { themeChange: '+1.8%', spChange: '+0.4%', reason: 'DOE fast-tracked SMR permits' },
  'ai-infrastructure': { themeChange: '+2.1%', spChange: '+0.4%', reason: 'NVIDIA announced new chip orders' },
  'defense-reshoring': { themeChange: '+0.9%', spChange: '+0.4%', reason: 'Pentagon increased procurement budget' },
  'energy-storage': { themeChange: '+1.4%', spChange: '+0.4%', reason: 'Grid-scale battery costs hit new low' },
  'space-economy': { themeChange: '+0.7%', spChange: '+0.4%', reason: 'SpaceX completed Starship test' },
  'quantum-computing': { themeChange: '-0.3%', spChange: '+0.4%', reason: 'Competitor announced breakthrough' },
};

const defaultPlaceholder = { themeChange: '+1.2%', spChange: '+0.4%', reason: 'Market momentum continues' };

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

export function YourCallsToday() {
  const { predictions } = usePredictions();
  const { setCurrentScreen, setSelectedPlaylist } = useApp();
  const [viewUpdates, setViewUpdates] = useState<Record<string, ViewUpdate>>({});

  // Don't render if no predictions
  if (predictions.length === 0) return null;

  const handleViewUpdate = (playlistId: string, update: ViewUpdate) => {
    setViewUpdates(prev => ({ ...prev, [playlistId]: update }));
    // TODO: Save to database in future
  };

  const handleCardClick = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentScreen('playlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="px-6 mb-6"
    >
      <h2 className="text-sm font-semibold text-foreground mb-3">Your Calls Today</h2>
      
      <div className="space-y-3">
        {predictions.slice(0, 3).map((pred) => {
          const playlist = playlists.find(p => p.id === pred.playlist_id);
          if (!playlist) return null;

          const data = placeholderData[pred.playlist_id] || defaultPlaceholder;
          const hasUpdate = viewUpdates[pred.playlist_id];

          return (
            <div
              key={pred.id || pred.playlist_id}
              className="card-surface p-4"
            >
              {/* Theme name - clickable */}
              <div 
                onClick={() => handleCardClick(pred.playlist_id)}
                className="cursor-pointer"
              >
                <h3 className="font-medium text-foreground text-sm mb-2">{playlist.title}</h3>
              </div>

              {/* Performance */}
              <p className="text-xs text-muted-foreground mb-2">
                <span className={data.themeChange.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>
                  {data.themeChange}
                </span>
                <span className="text-muted-foreground"> vs S&P </span>
                <span className={data.spChange.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>
                  {data.spChange}
                </span>
              </p>

              {/* Prediction tag */}
              <div className="mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getPredictionColor(pred.prediction as PredictionType)}`}>
                  Your call: {getPredictionLabel(pred.prediction as PredictionType)}
                </span>
              </div>

              {/* Why it moved */}
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Why it moved:</span> {data.reason}
              </p>

              {/* View update buttons */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Update your view:</p>
                <div className="flex items-center gap-2">
                  {(['stronger', 'same', 'weaker'] as ViewUpdate[]).map((update) => {
                    const isSelected = hasUpdate === update;
                    return (
                      <button
                        key={update}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUpdate(pred.playlist_id, update);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span className="capitalize">{update}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}