import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Playlist } from '@/types/playlist';
import { MatchBadge } from './MatchBadge';
import { ThemeIllustration } from '@/components/playlist/ThemeIllustration';
import { useStockDataContext } from '@/context/StockDataContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  showMatchScore?: boolean;
}

export function PlaylistCard({ playlist, onClick, showMatchScore = false }: PlaylistCardProps) {
  const showBadge = showMatchScore && playlist.matchScore && playlist.matchScore >= 50;
  const { getBenchmarkPerformance } = useStockDataContext();
  
  const { performance, isPositive, isLoading } = getBenchmarkPerformance(playlist.id);

  return (
    <motion.button
      onClick={onClick}
      className="w-full card-interactive overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Theme Illustration */}
      <div className="relative h-32 bg-background flex items-center justify-center">
        <ThemeIllustration themeId={playlist.id} className="w-20 h-20" />
        
        {/* Match Badge */}
        {showBadge && (
          <div className="absolute top-3 right-3">
            <MatchBadge score={playlist.matchScore!} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 text-left">
        <h3 className="font-semibold text-foreground mb-2">{playlist.title}</h3>

        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <p className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {performance}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {playlist.stocks.length} stocks
          </p>
        </div>
      </div>
    </motion.button>
  );
}
