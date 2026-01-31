import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Playlist } from '@/types/playlist';
import { MatchLevel } from '@/utils/matchScore';
import { MatchBadge } from './MatchBadge';

interface TopMatchGridCardProps {
  playlist: Playlist;
  matchScore: number;
  matchLevel: MatchLevel;
  matchReasons: string[];
  rank: number;
  isWatchlisted: boolean;
  onStarClick: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function TopMatchGridCard({
  playlist,
  matchScore,
  matchLevel,
  matchReasons,
  rank,
  isWatchlisted,
  onStarClick,
  onClick
}: TopMatchGridCardProps) {
  // Gradient based on match level
  const gradients = {
    excellent: 'from-green-500/10 to-transparent',
    great: 'from-blue-500/10 to-transparent',
    good: 'from-purple-500/10 to-transparent',
    none: 'from-primary/10 to-transparent'
  };

  const borderColors = {
    excellent: 'border-green-400/30',
    great: 'border-blue-400/30',
    good: 'border-purple-400/30',
    none: 'border-primary/30'
  };

  const hoverBorderColors = {
    excellent: 'hover:border-green-400/50',
    great: 'hover:border-blue-400/50',
    good: 'hover:border-purple-400/50',
    none: 'hover:border-primary/50'
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`w-full p-4 md:p-6 rounded-xl border-2 ${borderColors[matchLevel]} ${hoverBorderColors[matchLevel]} bg-gradient-to-r ${gradients[matchLevel]} transition-all hover:scale-[1.02] text-left`}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Rank indicator */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/50 flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
        </div>

        {/* Title and Badge */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 truncate">
            {playlist.title}
          </h3>
          <MatchBadge
            score={matchScore}
            level={matchLevel}
            size="sm"
            animate={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Star Button */}
          <button
            onClick={onStarClick}
            className={`p-2 rounded-full transition-colors ${
              isWatchlisted
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Match Reason */}
      {matchReasons.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {matchReasons[0]}
          </p>
        </div>
      )}

      {/* Match Reason Chips */}
      {matchReasons.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {matchReasons.slice(0, 3).map((reason, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full bg-secondary/60 text-foreground text-xs"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{playlist.stocks.length} companies</span>
        {playlist.tags.length > 0 && (
          <>
            <span>•</span>
            <span className="truncate">{playlist.tags.slice(0, 2).join(', ')}</span>
          </>
        )}
      </div>
    </motion.button>
  );
}
