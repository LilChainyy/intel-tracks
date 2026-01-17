import { motion } from 'framer-motion';
import { Playlist } from '@/types/playlist';
import { MatchBadge } from './MatchBadge';
import { ThemeIllustration } from '@/components/playlist/ThemeIllustration';

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
      className="w-full card-interactive overflow-hidden h-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Theme Illustration */}
      <div className="relative h-32 md:h-40 bg-background flex items-center justify-center">
        <ThemeIllustration themeId={playlist.id} className="w-20 h-20 md:w-24 md:h-24" />
        
        {/* Match Badge */}
        {showBadge && (
          <div className="absolute top-3 right-3">
            <MatchBadge score={playlist.matchScore!} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 text-left">
        <h3 className="font-semibold text-foreground mb-2 md:text-lg">{playlist.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          {playlist.stocks.length} stocks
        </p>
      </div>
    </motion.button>
  );
}
