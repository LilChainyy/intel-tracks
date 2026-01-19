import { motion } from 'framer-motion';
import { ChevronRight, Flame, Bookmark } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';

export function ProfileScreen() {
  const { setCurrentScreen, savedStocks } = useApp();

  // Mock progress data - in production this would come from user_research_xp table
  const progressData = {
    level: 2,
    levelName: 'Intermediate Investor',
    currentXP: 1250,
    nextLevelXP: 2000,
    companiesResearched: 3,
    theoriesCreated: 2,
    daysActive: 8,
    currentStreak: 3
  };

  const xpProgress = (progressData.currentXP / progressData.nextLevelXP) * 100;

  return (
    <div className="min-h-screen pb-24 md:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="pt-12 md:pt-8 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
          >
            Profile
          </motion.h1>
        </div>

        {/* Your Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3 md:text-lg">YOUR PROGRESS</h3>
          <div className="card-surface p-5 md:p-6">
            {/* Level Display */}
            <div className="text-center mb-4">
              <p className="text-lg md:text-xl font-bold text-foreground">
                Level {progressData.level}: {progressData.levelName}
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4 md:mb-6">
              <Progress value={xpProgress} className="h-3 md:h-4" />
              <p className="text-sm md:text-base text-muted-foreground text-center mt-2">
                {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} XP to Level {progressData.level + 1}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.companiesResearched}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Companies Researched</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.theoriesCreated}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Theories Created</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.daysActive}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Days Active</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                  {progressData.currentStreak} days <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Saved Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3 md:text-lg">SAVED</h3>
          <div className="card-surface p-5 md:p-6">
            {savedStocks.length > 0 ? (
              <div className="space-y-3">
                {savedStocks.map((stock) => (
                  <div key={stock.ticker} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    {stock.logoUrl && (
                      <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{stock.ticker}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{stock.playlistTitle}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No saved stocks yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Stocks you save will appear here
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Store Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setCurrentScreen('store')}
            className="w-full card-surface p-4 md:p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-left">
                <p className="font-semibold text-foreground md:text-lg">Rewards Store</p>
                <p className="text-sm md:text-base text-muted-foreground">Redeem your XP for gift cards</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
