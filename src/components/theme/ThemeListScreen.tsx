import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { Input } from '@/components/ui/input';

export function ThemeListScreen() {
  const { 
    setCurrentScreen, 
    setSelectedPlaylist, 
    isThemeWatchlisted, 
    toggleWatchlistTheme,
    completedCompanies 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = playlists.filter(theme => 
    theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

      {/* Theme Cards */}
      <div className="space-y-3">
        {filteredThemes.map((theme, index) => {
          const completedCount = theme.stocks.filter(s => completedCompanies.includes(s.ticker)).length;
          const isWatchlisted = isThemeWatchlisted(theme.id);
          
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
