import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight, Sparkles, TrendingUp, Library } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { playlists } from '@/data/playlists';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateMatchScore, getMatchLevel, getMatchLabel, type UserMatchProfile } from '@/utils/matchScore';
import { convertToUserProfile } from '@/utils/investorScoring';
import { generateMatchReasons } from '@/utils/matchReasons';
import { TopMatchHeroCard } from './TopMatchHeroCard';
import { TopMatchGridCard } from './TopMatchGridCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ThemeListScreen() {
  const {
    setCurrentScreen,
    setSelectedPlaylist,
    isThemeWatchlisted,
    toggleWatchlistTheme,
    completedCompanies
  } = useApp();
  const { state } = useInvestorQuiz();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  // Debug: Log quiz state
  useEffect(() => {
    console.log('ThemeListScreen - Quiz State:', {
      isComplete: state.isComplete,
      hasCalculatedScores: !!state.calculatedScores,
      persona: state.persona?.type,
      hasSkipped: state.hasSkipped
    });
  }, [state.isComplete, state.calculatedScores, state.persona, state.hasSkipped]);

  // Calculate match scores if user has completed quiz
  const playlistsWithScores = useMemo(() => {
    if (!state.isComplete || !state.calculatedScores) {
      console.log('No match scores - isComplete:', state.isComplete, 'hasScores:', !!state.calculatedScores);
      return playlists.map(p => ({ ...p, matchScore: undefined }));
    }

    const userProfile: UserMatchProfile = convertToUserProfile(state.calculatedScores);

    const scored = playlists.map(playlist => ({
      ...playlist,
      matchScore: calculateMatchScore(userProfile, { ...playlist, id: playlist.id })
    }));

    console.log('Match scores calculated:', scored.slice(0, 3).map(p => ({ title: p.title, score: p.matchScore })));

    return scored;
  }, [state.isComplete, state.calculatedScores]);

  // Filter and sort themes
  const filteredThemes = useMemo(() => {
    let themes = playlistsWithScores.filter(theme =>
      theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort by match score if available (high to low)
    if (state.isComplete && themes.some(t => t.matchScore !== undefined)) {
      themes = themes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return themes;
  }, [playlistsWithScores, searchQuery, state.isComplete]);

  // Get top matches (score >= 40) for personalized section
  const topMatches = useMemo(() => {
    if (!state.isComplete) return [];
    const matches = filteredThemes.filter(t => (t.matchScore || 0) >= 40).slice(0, 5);
    console.log('Top matches found:', matches.length, 'All scores:', filteredThemes.slice(0, 5).map(t => ({ title: t.title, score: t.matchScore })));
    return matches;
  }, [filteredThemes, state.isComplete]);

  // Split top matches into hero (first) and grid (rest)
  const heroMatch = topMatches[0];
  const gridMatches = topMatches.slice(1);

  // Get user profile for match reasons
  const userProfile = useMemo(() => {
    if (!state.isComplete || !state.calculatedScores) return null;
    const profile = convertToUserProfile(state.calculatedScores);
    console.log('User profile created:', !!profile);
    return profile;
  }, [state.isComplete, state.calculatedScores]);

  // Debug: Check conditions for showing personalized section
  useEffect(() => {
    console.log('Personalized section conditions:', {
      isComplete: state.isComplete,
      topMatchesCount: topMatches.length,
      hasSearchQuery: !!searchQuery,
      hasUserProfile: !!userProfile,
      shouldShow: state.isComplete && topMatches.length > 0 && !searchQuery && !!userProfile
    });
  }, [state.isComplete, topMatches.length, searchQuery, userProfile]);

  // Show celebration toast on first visit after quiz completion
  useEffect(() => {
    if (state.isComplete && topMatches.length > 0 && !localStorage.getItem('quiz_celebration_shown')) {
      toast({
        title: "🎉 Quiz Complete!",
        description: `We found ${topMatches.length} perfect match${topMatches.length > 1 ? 'es' : ''} for your ${state.persona?.type || 'investing'} style`,
        duration: 5000,
      });
      localStorage.setItem('quiz_celebration_shown', 'true');
    }
  }, [state.isComplete, topMatches.length, state.persona?.type, toast]);

  const handleThemeClick = (theme: typeof playlists[0]) => {
    setSelectedPlaylist(theme);
    setCurrentScreen('company-list');
  };

  const handleStarClick = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    toggleWatchlistTheme(themeId);
  };

  // Icons removed

  return (
    <div className="min-h-screen pb-24 px-6">
      {/* Header */}
      <div className="pt-12 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          Browse Themes
        </motion.h1>

        {/* Banner for users who skipped quiz */}
        {state.hasSkipped && !state.isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Take the 2-min quiz for personalized recommendations
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Discover which playlists match your investing style
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/quiz-onboarding')}
                  className="h-8 text-xs"
                >
                  Take Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>
      </div>

      {/* Top Matches Section */}
      {state.isComplete && topMatches.length > 0 && !searchQuery && userProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Your Top Matches
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on your {state.persona?.type || 'investing'} profile
              </p>
            </div>
          </div>

          {/* Hero Match (Top 1) */}
          {heroMatch && (
            <TopMatchHeroCard
              playlist={heroMatch}
              matchScore={heroMatch.matchScore!}
              matchLevel={getMatchLevel(heroMatch.matchScore!)}
              matchReasons={generateMatchReasons(userProfile, heroMatch)}
              onClick={() => handleThemeClick(heroMatch)}
            />
          )}

          {/* Grid Matches (2-5) */}
          {gridMatches.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {gridMatches.map((theme, index) => (
                <TopMatchGridCard
                  key={theme.id}
                  playlist={theme}
                  matchScore={theme.matchScore!}
                  matchLevel={getMatchLevel(theme.matchScore!)}
                  matchReasons={generateMatchReasons(userProfile, theme)}
                  rank={index + 2}
                  isWatchlisted={isThemeWatchlisted(theme.id)}
                  onStarClick={(e) => handleStarClick(e, theme.id)}
                  onClick={() => handleThemeClick(theme)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* All Themes Header */}
      {state.isComplete && topMatches.length > 0 && !searchQuery && (
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Library className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">All Themes</h2>
              <p className="text-sm text-muted-foreground">Explore more playlists</p>
            </div>
          </div>
        </div>
      )}

      {/* Theme Cards */}
      <div className="space-y-3">
        {filteredThemes.map((theme, index) => {
          const completedCount = theme.stocks.filter(s => completedCompanies.includes(s.ticker)).length;
          const isWatchlisted = isThemeWatchlisted(theme.id);
          const matchScore = theme.matchScore;
          const showMatchScore = state.isComplete && matchScore !== undefined;

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => handleThemeClick(theme)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
              >
                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{theme.title}</h3>
                    {showMatchScore && (
                      <span className="text-xs text-muted-foreground">
                        {matchScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{theme.tags.join(', ')}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{theme.stocks.length} companies</span>
                    {completedCount > 0 && (
                      <span className="text-xs text-primary">{completedCount} completed</span>
                    )}
                  </div>
                </div>

                {/* Star Button */}
                <button
                  onClick={(e) => handleStarClick(e, theme.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isWatchlisted
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
