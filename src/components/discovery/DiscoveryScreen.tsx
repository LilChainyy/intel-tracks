import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { playlists } from '@/data/playlists';
import { PlaylistCard } from './PlaylistCard';
import { calculateMatchScore } from '@/utils/matchScore';
import { Playlist } from '@/types/playlist';

export function DiscoveryScreen() {
  const { setCurrentScreen, setSelectedPlaylist, quizCompleted } = useApp();
  const { state, resetQuiz } = useInvestorQuiz();

  // Build a simplified user profile from the new quiz state for match scoring
  const userProfile = state.isComplete && state.calculatedScores ? {
    risk: state.calculatedScores.riskTolerance <= 30 ? 'safe' as const :
          state.calculatedScores.riskTolerance <= 50 ? 'balanced' as const :
          state.calculatedScores.riskTolerance <= 70 ? 'growth' as const : 'yolo' as const,
    sectors: [] as string[], // Could map from archetype later
    timeline: state.calculatedScores.timeHorizon >= 70 ? 'forever' as const :
              state.calculatedScores.timeHorizon >= 50 ? 'long' as const :
              state.calculatedScores.timeHorizon >= 30 ? 'medium' as const : 'short' as const,
    quizCompletedAt: new Date()
  } : null;

  // Calculate match scores and sort playlists
  const sortedPlaylists: Playlist[] = playlists.map((playlist) => ({
    ...playlist,
    matchScore: userProfile ? calculateMatchScore(userProfile, playlist) : undefined
  })).sort((a, b) => {
    if (a.matchScore && b.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return 0;
  });

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('playlist');
  };

  const handleTakeQuiz = () => {
    resetQuiz();
    setCurrentScreen('quiz');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Discover
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          Where smart money is flowing
        </motion.p>
      </div>

      {/* Quiz banner (if not completed) */}
      {!quizCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-6 mb-6"
        >
          <div className="card-surface p-4 flex items-center justify-between gap-4 bg-gradient-to-r from-card to-secondary">
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <p className="text-sm font-medium text-foreground">Personalize your feed</p>
                <p className="text-xs text-muted-foreground">Take 30s quiz to see your matches</p>
              </div>
            </div>
            <button
              onClick={handleTakeQuiz}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full whitespace-nowrap"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>
      )}

      {/* Playlist grid */}
      <div className="px-6 space-y-4">
        {sortedPlaylists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <PlaylistCard
              playlist={playlist}
              onClick={() => handlePlaylistClick(playlist)}
              showMatchScore={quizCompleted}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
