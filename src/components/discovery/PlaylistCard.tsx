import { motion } from 'framer-motion';
import { Playlist } from '@/types/playlist';
import { MatchBadge } from './MatchBadge';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  showMatchScore?: boolean;
}

export function PlaylistCard({ playlist, onClick, showMatchScore = false }: PlaylistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card-interactive overflow-hidden cursor-pointer"
    >
      {/* Hero image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={playlist.heroImage}
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        
        {/* Match badge */}
        {showMatchScore && playlist.matchScore && playlist.matchScore >= 50 && (
          <div className="absolute top-3 right-3">
            <MatchBadge score={playlist.matchScore} />
          </div>
        )}

        {/* Title on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{playlist.emoji}</span>
            <h3 className="text-lg font-bold text-foreground">{playlist.title}</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">💰</span>
          <span className="text-muted-foreground">{playlist.whoBuying.slice(0, 2).join(' · ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-400">📈</span>
          <span className="text-emerald-400">{playlist.proofPoint}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {playlist.stocks.length} stocks
        </p>
      </div>
    </motion.div>
  );
}
