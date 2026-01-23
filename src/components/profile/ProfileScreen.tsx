import { motion } from 'framer-motion';
import { ChevronRight, Flame, Bookmark, Settings, HelpCircle, Bell, Trophy, Lock, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';

export function ProfileScreen() {
  const { setCurrentScreen, savedStocks, completedCompanies } = useApp();

  // Mock progress data
  const progressData = {
    level: 2,
    levelName: 'Intermediate Investor',
    currentXP: 1250,
    nextLevelXP: 2000,
    companiesResearched: completedCompanies.length,
    theoriesCreated: 2,
    daysActive: 8,
    currentStreak: 3
  };

  const xpProgress = (progressData.currentXP / progressData.nextLevelXP) * 100;

  // Achievements
  const achievements = [
    { id: 1, name: 'First Steps', description: 'Learn your first company', unlocked: true, icon: '🎯' },
    { id: 2, name: 'Week Warrior', description: '7 day streak', unlocked: true, icon: '🔥' },
    { id: 3, name: 'Theme Master', description: 'Complete a full theme', unlocked: false, icon: '📚' },
    { id: 4, name: 'Market Watcher', description: 'Check 10 catalysts', unlocked: false, icon: '👀' },
    { id: 5, name: 'Watchlist Pro', description: 'Save 5 companies', unlocked: false, icon: '⭐' },
  ];

  return (
    <div className="min-h-screen pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="pt-6 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
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
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">YOUR PROGRESS</h3>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="text-center mb-4">
              <p className="text-lg font-bold text-foreground">
                Level {progressData.level}: {progressData.levelName}
              </p>
            </div>
            <div className="mb-4">
              <Progress value={xpProgress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center mt-2">
                {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} XP
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{progressData.companiesResearched}</p>
                <p className="text-xs text-muted-foreground">Companies</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  {progressData.currentStreak} <Flame className="w-4 h-4 text-orange-500" />
                </p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Your Investing Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">YOUR INVESTING STYLE</h3>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                🧭
              </div>
              <div>
                <p className="font-semibold text-foreground">The Explorer</p>
                <p className="text-sm text-muted-foreground">Curious & Research-Driven</p>
              </div>
            </div>
            <button className="w-full py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
              Retake Quiz
            </button>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">ACHIEVEMENTS</h3>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex items-center gap-3 p-4 ${achievement.unlocked ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  achievement.unlocked ? 'bg-primary/10' : 'bg-secondary'
                }`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">SETTINGS</h3>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground">Notifications</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground">Help & Support</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground">App Settings</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
