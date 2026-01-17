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
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="px-6 md:px-8 lg:px-12 pt-12 md:pt-8 pb-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
        >
          Discover
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-base text-muted-foreground mt-1"
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
          className="px-6 md:px-8 lg:px-12 mb-6 max-w-6xl mx-auto"
        >
          <div className="card-surface p-4 md:p-6 flex items-center justify-between gap-4 bg-gradient-to-r from-card to-secondary">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">🎯</span>
              <div>
                <p className="text-sm md:text-base font-medium text-foreground">Personalize your feed</p>
                <p className="text-xs md:text-sm text-muted-foreground">Take 30s quiz to see your matches</p>
              </div>
            </div>
            <button
              onClick={handleTakeQuiz}
              className="px-3 md:px-5 py-1.5 md:py-2 bg-primary text-primary-foreground text-sm md:text-base font-medium rounded-full whitespace-nowrap"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>
      )}

      {/* Playlist grid */}
      <div className="px-6 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
    </div>
  );
}
