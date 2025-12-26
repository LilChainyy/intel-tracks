import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playlists } from '@/data/playlists';

interface RevealCardProps {
  prediction: {
    id: string;
    playlist_id: string;
    prediction: string;
    conviction: number;
    actual_performance?: number;
    sp500_performance?: number;
    is_correct?: boolean;
    edge_earned?: number;
  };
  onReveal: (predictionId: string) => void;
  onSeeAutopsy: (predictionId: string) => void;
}

export function RevealCard({ prediction, onReveal, onSeeAutopsy }: RevealCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  const blur = useTransform(x, [0, 100], [8, 0]);
  const opacity = useTransform(x, [0, 100], [0.3, 1]);

  const playlist = playlists.find(p => p.id === prediction.playlist_id);
  
  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) {
      setIsRevealed(true);
      onReveal(prediction.id);
    }
    setIsDragging(false);
  };

  const handleTapReveal = () => {
    setIsRevealed(true);
    onReveal(prediction.id);
  };

  const formatPerformance = (value?: number) => {
    if (value === undefined || value === null) return '--';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const predictionLabel = prediction.prediction.charAt(0).toUpperCase() + prediction.prediction.slice(1);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="hidden"
            className="relative"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x }}
          >
            {/* Blurred overlay */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3"
              style={{ 
                filter: blur.get() ? `blur(${blur.get()}px)` : undefined,
                opacity 
              }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Ready to reveal</p>
              <p className="text-xs text-muted-foreground">
                {isDragging ? 'Keep sliding...' : 'Swipe right or tap to reveal'}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTapReveal}
                className="mt-2"
              >
                Reveal Result
              </Button>
            </motion.div>

            {/* Hidden content (visible through blur) */}
            <div className="card-surface p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                {playlist?.title || 'Theme'}
              </p>
              <p className="text-xs text-muted-foreground">
                Your call: {predictionLabel} at {prediction.conviction}%
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`card-surface p-4 border-l-4 ${
              prediction.is_correct 
                ? 'border-l-emerald-500' 
                : 'border-l-rose-500'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {playlist?.title || 'Theme'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your call: {predictionLabel} at {prediction.conviction}% conviction
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                prediction.is_correct
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {prediction.is_correct ? 'Correct' : 'Missed'}
              </div>
            </div>

            {/* Performance comparison */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-0.5">Theme Result</p>
                <p className={`text-lg font-bold ${
                  (prediction.actual_performance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatPerformance(prediction.actual_performance)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-0.5">S&P 500</p>
                <p className={`text-lg font-bold ${
                  (prediction.sp500_performance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatPerformance(prediction.sp500_performance)}
                </p>
              </div>
            </div>

            {/* Edge earned */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Edge earned</p>
                <p className={`text-lg font-bold ${
                  (prediction.edge_earned || 0) > 0 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {prediction.edge_earned && prediction.edge_earned > 0 
                    ? `+${prediction.edge_earned}` 
                    : '0'}
                </p>
              </div>
              {!prediction.is_correct && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onSeeAutopsy(prediction.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  See what happened
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {prediction.is_correct && (
                <p className="text-xs text-emerald-400">
                  Calibration score improved
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
