import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { playlists } from '@/data/playlists';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateMatchScore, type UserMatchProfile } from '@/utils/matchScore';
import { convertToUserProfile } from '@/utils/investorScoring';
import { MatchPercentageBadge } from './MatchPercentageBadge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [ytdData, setYtdData] = useState<Record<string, number | null>>({});
  const [ytdLoading, setYtdLoading] = useState(true);

  // Calculate match scores if user has completed quiz
  const playlistsWithScores = useMemo(() => {
    if (!state.isComplete || !state.calculatedScores) {
      return playlists.map(p => ({ ...p, matchScore: undefined }));
    }

    const userProfile: UserMatchProfile = convertToUserProfile(state.calculatedScores);

    const scored = playlists.map(playlist => ({
      ...playlist,
      matchScore: calculateMatchScore(userProfile, { ...playlist, id: playlist.id })
    }));

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

  // Check if we have match scores to show personalized header
  const hasMatchScores = useMemo(() => {
    return state.isComplete && filteredThemes.some(t => t.matchScore !== undefined);
  }, [state.isComplete, filteredThemes]);

  // Show celebration toast on first visit after quiz completion
  useEffect(() => {
    if (state.isComplete && filteredThemes.length > 0 && !localStorage.getItem('quiz_celebration_shown')) {
      toast({
        title: "🎉 Quiz Complete!",
        description: `Your themes are now personalized to your ${state.persona?.type || 'investing'} style`,
        duration: 5000,
      });
      localStorage.setItem('quiz_celebration_shown', 'true');
    }
  }, [state.isComplete, filteredThemes.length, state.persona?.type, toast]);

  // Fetch YTD data for all playlists
  useEffect(() => {
    async function fetchYTDData() {
      try {
        // Get all unique tickers from all playlists
        const allTickers = [...new Set(playlists.flatMap(p => p.stocks.map(s => s.ticker)))];

        const { data, error } = await supabase
          .from('stock_quotes')
          .select('ticker, ytd_change')
          .in('ticker', allTickers);

        if (error) {
          console.error('Error fetching stock quotes:', error);
        }

        if (data) {
          const ytdMap: Record<string, number | null> = {};

          // For each playlist, calculate average YTD
          playlists.forEach(playlist => {
            const playlistYTDs = playlist.stocks
              .map(stock => {
                const quote = data.find(d => d.ticker === stock.ticker);
                return quote?.ytd_change ? Number(quote.ytd_change) : null;
              })
              .filter((ytd): ytd is number => ytd !== null);

            if (playlistYTDs.length > 0) {
              const avgYTD = playlistYTDs.reduce((sum, ytd) => sum + ytd, 0) / playlistYTDs.length;
              ytdMap[playlist.id] = avgYTD;
            } else {
              ytdMap[playlist.id] = null;
            }
          });

          setYtdData(ytdMap);
        }
      } catch (error) {
        console.error('Error fetching YTD data:', error);
      } finally {
        setYtdLoading(false);
      }
    }

    fetchYTDData();
  }, []);

  const handleThemeClick = (theme: typeof playlists[0]) => {
    setSelectedPlaylist(theme);
    setCurrentScreen('company-list');
  };

  const handleStarClick = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    toggleWatchlistTheme(themeId);
  };

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

      {/* Personalized Header (shown when quiz complete) */}
      {hasMatchScores && !searchQuery && (
        <motion.div className="mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Your personalized matches
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on your {state.persona?.type || 'trader'} profile
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Theme Cards */}
      <div className="space-y-3">
        {filteredThemes.map((theme, index) => (
          <UniformThemeCard
            key={theme.id}
            theme={theme}
            matchScore={theme.matchScore}
            index={index}
            isWatchlisted={isThemeWatchlisted(theme.id)}
            completedCount={theme.stocks.filter(s => completedCompanies.includes(s.ticker)).length}
            ytdChange={ytdData[theme.id] ?? null}
            ytdLoading={ytdLoading}
            onThemeClick={() => handleThemeClick(theme)}
            onStarClick={(e) => handleStarClick(e, theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Uniform Theme Card Component
interface UniformThemeCardProps {
  theme: typeof playlists[0] & { matchScore?: number };
  matchScore?: number;
  index: number;
  isWatchlisted: boolean;
  completedCount: number;
  ytdChange: number | null;
  ytdLoading: boolean;
  onThemeClick: () => void;
  onStarClick: (e: React.MouseEvent) => void;
}

function UniformThemeCard({
  theme,
  matchScore,
  index,
  isWatchlisted,
  completedCount,
  ytdChange,
  ytdLoading,
  onThemeClick,
  onStarClick
}: UniformThemeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <button
        onClick={onThemeClick}
        className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
      >
        {/* Content */}
        <div className="flex-1 text-left min-w-0 flex gap-3">
          {/* Left: Title, Tags, Company Count */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1">
              {theme.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {theme.tags.join(', ')}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">
                {theme.stocks.length} companies
              </span>
              {completedCount > 0 && (
                <span className="text-xs text-primary">
                  {completedCount} completed
                </span>
              )}
            </div>
          </div>

          {/* Right: Match Badge & YTD Column */}
          <div className="flex flex-col items-end justify-start gap-1.5">
            {matchScore !== undefined && (
              <MatchPercentageBadge score={matchScore} size="sm" />
            )}
            {/* YTD Visual Indicator */}
            {!ytdLoading && ytdChange != null && typeof ytdChange === 'number' && (
              <div className="flex flex-col items-center gap-1">
                {/* Signal Bars */}
                {(() => {
                  const absYtd = Math.abs(ytdChange);
                  const isPositive = ytdChange >= 0;
                  const isZero = ytdChange === 0;

                  // Calculate filled bars: 0% = 1 neutral, 1-100% = 1-5 colored
                  let filledBars;
                  if (isZero) {
                    filledBars = 1;
                  } else {
                    filledBars = Math.max(1, Math.ceil((Math.min(absYtd, 100) / 100) * 5));
                  }

                  const baseHeight = 3; // Base height in pixels

                  return (
                    <div className="flex items-end gap-0.5">
                      {[1, 2, 3, 4, 5].map((barIndex) => (
                        <div
                          key={barIndex}
                          className={`w-1 rounded-sm ${
                            barIndex <= filledBars
                              ? isZero
                                ? 'bg-gray-300 dark:bg-gray-600'  // Neutral color for 0%
                                : isPositive ? 'bg-emerald-500' : 'bg-red-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          style={{ height: `${baseHeight * barIndex}px` }}
                        />
                      ))}
                    </div>
                  );
                })()}

                {/* Percentage */}
                <span className={`text-xs font-semibold whitespace-nowrap ${ytdChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {ytdChange >= 0 ? '+' : ''}{ytdChange.toFixed(1)}% YTD
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Star Button */}
        <button
          onClick={onStarClick}
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
}
