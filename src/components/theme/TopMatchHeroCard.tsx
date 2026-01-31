import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Playlist } from '@/types/playlist';
import { MatchLevel } from '@/utils/matchScore';
import { MatchBadge } from './MatchBadge';

interface TopMatchHeroCardProps {
  playlist: Playlist;
  matchScore: number;
  matchLevel: MatchLevel;
  matchReasons: string[];
  onClick: () => void;
}

export function TopMatchHeroCard({
  playlist,
  matchScore,
  matchLevel,
  matchReasons,
  onClick
}: TopMatchHeroCardProps) {
  // Gradient based on match level
  const gradients = {
    excellent: 'from-green-500/20 via-green-400/10 to-transparent',
    great: 'from-blue-500/20 via-blue-400/10 to-transparent',
    good: 'from-purple-500/20 via-purple-400/10 to-transparent',
    none: 'from-primary/20 via-primary/10 to-transparent'
  };

  const borderColors = {
    excellent: 'border-green-400/40',
    great: 'border-blue-400/40',
    good: 'border-purple-400/40',
    none: 'border-primary/40'
  };

  const hoverBorderColors = {
    excellent: 'hover:border-green-400/60',
    great: 'hover:border-blue-400/60',
    good: 'hover:border-purple-400/60',
    none: 'hover:border-primary/60'
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className={`w-full p-6 md:p-8 rounded-2xl border-[3px] ${borderColors[matchLevel]} ${hoverBorderColors[matchLevel]} bg-gradient-to-br ${gradients[matchLevel]} transition-all hover:scale-[1.02] hover:shadow-2xl`}
    >
      <div className="flex items-start gap-6">
        {/* Match Badge */}
        <div className="flex-shrink-0">
          <MatchBadge
            score={matchScore}
            level={matchLevel}
            size="lg"
            variant="circular"
            animate={true}
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-left space-y-4">
          {/* Header */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-semibold text-primary uppercase tracking-wide mb-2"
            >
              #1 Top Match
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
            >
              {playlist.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-muted-foreground"
            >
              {playlist.signal}
            </motion.p>
          </div>

          {/* Match Reasons */}
          {matchReasons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              {matchReasons.map((reason, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-secondary/80 text-foreground text-xs font-medium border border-border"
                >
                  {reason}
                </span>
              ))}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 text-sm text-muted-foreground"
          >
            <span>{playlist.stocks.length} companies</span>
            <span>•</span>
            <span>{playlist.tags.slice(0, 2).join(', ')}</span>
          </motion.div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}
