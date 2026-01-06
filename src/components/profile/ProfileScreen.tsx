import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useQuiz } from '@/context/QuizContext';
import { Progress } from '@/components/ui/progress';

const answerLabels: Record<string, Record<string, string>> = {
  risk: {
    safe: 'Steady wins',
    balanced: 'Balanced',
    growth: 'Growth',
    yolo: 'Moon shots'
  },
  timeline: {
    short: '< 1 year',
    medium: '1-3 years',
    long: '3-5 years',
    forever: '5+ years'
  },
  sectors: {
    tech: 'Tech',
    energy: 'Energy',
    healthcare: 'Healthcare',
    finance: 'Finance',
    consumer: 'Consumer',
    industrial: 'Industrial',
    space: 'Space',
    entertainment: 'Entertainment'
  }
};

export function ProfileScreen() {
  const { quizCompleted, setCurrentScreen } = useApp();
  const { state, resetQuiz, startQuiz } = useQuiz();

  const handleTakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const summaryItems = quizCompleted
    ? [
        {
          label: 'Risk',
          value: answerLabels.risk[state.answers.risk as string] || 'Not set'
        },
        {
          label: 'Sectors',
          value: Array.isArray(state.answers.sectors)
            ? state.answers.sectors.map((s) => answerLabels.sectors[s]).join(', ')
            : 'Not set'
        },
        {
          label: 'Timeline',
          value: answerLabels.timeline[state.answers.timeline as string] || 'Not set'
        }
      ]
    : [];

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
    <div className="min-h-screen pb-24 px-6">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Profile
        </motion.h1>
      </div>

      {/* Investment DNA or Quiz CTA */}
      {quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-foreground text-center mb-2">Your Investment DNA</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">Based on your answers, here's what we found</p>
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="card-surface p-4">
                <span className="text-sm text-muted-foreground block mb-1">{item.label}</span>
                <span className="text-base font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleRetakeQuiz}
            className="w-full mt-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3">Personalize</h3>
          <div className="card-surface p-6 text-center">
            <h4 className="font-semibold text-foreground mb-1">Take the Quiz</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Find themes that match your investment style
            </p>
            <button onClick={handleTakeQuiz} className="btn-primary">
              Start Quiz
            </button>
          </div>
        </motion.div>
      )}

      {/* Your Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="section-header mb-3">🎓 YOUR PROGRESS</h3>
        <div className="card-surface p-5">
          {/* Level Display */}
          <div className="text-center mb-4">
            <p className="text-lg font-bold text-foreground">
              Level {progressData.level}: {progressData.levelName}
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <Progress value={xpProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} XP to Level {progressData.level + 1}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.companiesResearched}</p>
              <p className="text-xs text-muted-foreground">Companies Researched</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.theoriesCreated}</p>
              <p className="text-xs text-muted-foreground">Theories Created</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.daysActive}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                {progressData.currentStreak} days <Flame className="w-4 h-4 text-orange-500" />
              </p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </div>
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
          className="w-full card-surface p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <p className="font-semibold text-foreground">Rewards Store</p>
              <p className="text-sm text-muted-foreground">Redeem your XP for gift cards</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>
    </div>
  );
}
