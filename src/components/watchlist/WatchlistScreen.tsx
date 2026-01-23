import { motion } from 'framer-motion';
import { Star, X, Bookmark, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

export function WatchlistScreen() {
  const { 
    watchlistCompanies, 
    watchlistThemes, 
    toggleWatchlistCompany,
    toggleWatchlistTheme,
    setActiveTab,
    setCurrentScreen,
    setSelectedPlaylist,
    setSelectedStock
  } = useApp();

  const isEmpty = watchlistCompanies.length === 0 && watchlistThemes.length === 0;

  // Get full theme objects for watchlisted themes
  const watchlistedThemes = playlists.filter(p => watchlistThemes.includes(p.id));

  const handleCompanyClick = (stock: typeof watchlistCompanies[0]) => {
    const playlist = playlists.find(p => p.id === stock.playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setSelectedStock({ ticker: stock.ticker, playlist });
      setCurrentScreen('company-profile');
    }
  };

  const handleThemeClick = (theme: typeof playlists[0]) => {
    setSelectedPlaylist(theme);
    setCurrentScreen('company-list');
  };

  const handleRemoveCompany = (e: React.MouseEvent, stock: typeof watchlistCompanies[0]) => {
    e.stopPropagation();
    toggleWatchlistCompany(stock);
  };

  const handleRemoveTheme = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    toggleWatchlistTheme(themeId);
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 px-6 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-white fill-white" />
            <h1 className="text-2xl font-bold text-white">Your Watchlist</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-white/70">Companies</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-white/70">Themes</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <Bookmark className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Items Yet</h2>
          <p className="text-muted-foreground text-center mb-6">
            Star companies and themes to add them to your watchlist
          </p>
          <button
            onClick={() => setActiveTab('theme')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Themes
          </button>
        </div>

        {/* Pro Tip */}
        <div className="px-6">
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Pro Tip</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get notified when catalysts affect your watchlisted companies
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-white fill-white" />
          <h1 className="text-2xl font-bold text-white">Your Watchlist</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{watchlistCompanies.length}</p>
            <p className="text-xs text-white/70">Companies</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{watchlistedThemes.length}</p>
            <p className="text-xs text-white/70">Themes</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Companies Section */}
        {watchlistCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Companies</h2>
            <div className="space-y-2">
              {watchlistCompanies.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => handleCompanyClick(stock)}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                >
                  {stock.logoUrl ? (
                    <img 
                      src={stock.logoUrl} 
                      alt={stock.name} 
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{stock.ticker[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{stock.name}</p>
                    <p className="text-sm text-muted-foreground">{stock.ticker}</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveCompany(e, stock)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Themes Section */}
        {watchlistedThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Themes</h2>
            <div className="space-y-2">
              {watchlistedThemes.map((theme, index) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                    {index === 0 ? '⚡' : index === 1 ? '📺' : '🛒'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{theme.title}</p>
                    <p className="text-sm text-muted-foreground">{theme.stocks.length} companies</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveTheme(e, theme.id)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Pro Tip</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified when catalysts affect your watchlisted companies
          </p>
        </motion.div>
      </div>
    </div>
  );
}
