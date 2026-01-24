import { motion } from 'framer-motion';
import { Bell, ChevronRight, Sparkles, Flame, BookOpen, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { catalysts } from '@/data/catalysts';
import { Progress } from '@/components/ui/progress';

export function HomeScreen() {
  const { 
    setActiveTab, 
    setCurrentScreen, 
    setSelectedPlaylist, 
    setSelectedCatalyst,
    completedCompanies,
    watchlistCompanies 
  } = useApp();

  // Stats
  const companiesLearned = completedCompanies.length;
  const dayStreak = 3; // Mock for now
  const watching = watchlistCompanies.length;

  // Continue learning - get first incomplete company from first theme
  const continueTheme = playlists[0];
  const continueCompany = continueTheme?.stocks.find(s => !completedCompanies.includes(s.ticker));

  // First 3 themes for playlists section
  const displayThemes = playlists.slice(0, 3);
  
  // First 3 catalysts
  const displayCatalysts = catalysts.slice(0, 3);

  const handleThemeClick = (playlist: typeof playlists[0]) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('company-list');
  };

  const handleCatalystClick = (catalyst: typeof catalysts[0]) => {
    setSelectedCatalyst(catalyst);
    setCurrentScreen('catalyst-detail');
    setActiveTab('market');
  };

  const handleContinueLearning = () => {
    if (continueTheme && continueCompany) {
      setSelectedPlaylist(continueTheme);
      setSelectedStock({ ticker: continueCompany.ticker, playlist: continueTheme });
      setCurrentScreen('company-profile');
      window.scrollTo(0, 0);
    }
  };

  const setSelectedStock = useApp().setSelectedStock;

  return (
    <div className="min-h-screen pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary to-purple-600 px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/80 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold text-white">Investor</h1>
          </motion.div>
          <button className="p-2 bg-white/10 rounded-full">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stat Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <BookOpen className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{companiesLearned}</p>
            <p className="text-xs text-white/70">Companies</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 text-orange-300 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{dayStreak}</p>
            <p className="text-xs text-white/70">Day Streak</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Eye className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{watching}</p>
            <p className="text-xs text-white/70">Watching</p>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-4">
        {/* Continue Learning Card */}
        {continueCompany && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleContinueLearning}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-left mb-6"
          >
            <p className="text-white/80 text-xs mb-1">Continue Learning</p>
            <h3 className="text-lg font-bold text-white mb-1">{continueCompany.name}</h3>
            <p className="text-sm text-white/70 mb-3">{continueTheme.title}</p>
            <div className="flex items-center justify-between">
              <Progress value={30} className="flex-1 h-2 mr-4 bg-white/20" />
              <span className="text-xs text-white/80">5 min left</span>
            </div>
          </motion.button>
        )}

        {/* Your Playlists Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Your Playlists</h2>
            <button 
              onClick={() => setActiveTab('theme')}
              className="text-sm text-primary flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {displayThemes.map((theme, index) => {
              const completedCount = theme.stocks.filter(s => completedCompanies.includes(s.ticker)).length;
              const progress = (completedCount / theme.stocks.length) * 100;
              
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                    {index === 0 ? '⚡' : index === 1 ? '📺' : '🛒'}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-foreground">{theme.title}</h3>
                    <p className="text-xs text-muted-foreground">{completedCount}/{theme.stocks.length} companies</p>
                    <Progress value={progress} className="h-1.5 mt-2" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Catalysts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Today's Catalysts</h2>
            <button 
              onClick={() => setActiveTab('market')}
              className="text-sm text-primary flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {displayCatalysts.map((catalyst) => (
              <button
                key={catalyst.id}
                onClick={() => handleCatalystClick(catalyst)}
                className="w-full flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
                  {catalyst.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground text-sm">{catalyst.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      catalyst.impact === 'High' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {catalyst.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{catalyst.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{catalyst.category}</span>
                    <span className="text-xs text-muted-foreground">{catalyst.time}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Suggested For You */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-5 border border-primary/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Suggested for You</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your interests, explore the Nuclear Renaissance theme
          </p>
          <button 
            onClick={() => {
              setSelectedPlaylist(playlists[0]);
              setCurrentScreen('company-list');
            }}
            className="text-sm text-primary font-medium"
          >
            Explore Theme →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
