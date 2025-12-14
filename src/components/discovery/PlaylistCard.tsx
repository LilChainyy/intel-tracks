import { motion } from 'framer-motion';
import { Playlist } from '@/types/playlist';
import { MatchBadge } from './MatchBadge';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  showMatchScore?: boolean;
}

export function PlaylistCard({ playlist, onClick, showMatchScore = false }: PlaylistCardProps) {
  const showBadge = showMatchScore && playlist.matchScore && playlist.matchScore >= 50;

  return (
    <motion.button
      onClick={onClick}
      className="w-full card-interactive overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hero Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={playlist.heroImage}
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
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
          <p className="text-xs text-muted-foreground">
            {playlist.investors.slice(0, 2).join(' · ')}
          </p>
          <p className={`text-xs ${playlist.isPositivePerformance ? 'text-emerald-400' : 'text-red-400'}`}>
            {playlist.benchmarkPerformance}
          </p>
          <p className="text-xs text-muted-foreground">
            {playlist.stocks.length} stocks
          </p>
        </div>
      </div>
    </motion.button>
  );
}
