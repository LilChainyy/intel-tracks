import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useQuiz } from '@/context/QuizContext';
import { Progress } from '@/components/ui/progress';

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

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = {
      safe: 'Steady wins',
      balanced: 'Balanced',
      growth: 'Growth',
      yolo: 'Moon shots'
    };
    return labels[risk] || risk;
  };
  
  const getTimelineLabel = (timeline: string) => {
    const labels: Record<string, string> = {
      short: '< 1 year',
      medium: '1-3 years',
      long: '3-5 years',
      forever: '5+ years'
    };
    return labels[timeline] || timeline;
  };
  
  const getSectorLabel = (sector: string) => {
    const labels: Record<string, string> = {
      tech: 'Tech',
      energy: 'Energy',
      healthcare: 'Healthcare',
      finance: 'Finance',
      consumer: 'Consumer',
      industrial: 'Industrial',
      space: 'Space',
      entertainment: 'Entertainment'
    };
    return labels[sector] || sector;
  };

  const summaryItems = quizCompleted
    ? [
        {
          label: 'Risk',
          value: state.answers.risk ? getRiskLabel(state.answers.risk as string) : 'Not set'
        },
        {
          label: 'Sectors',
          value: Array.isArray(state.answers.sectors)
            ? state.answers.sectors.map((s) => getSectorLabel(s)).join(', ')
            : 'Not set'
        },
        {
          label: 'Timeline',
          value: state.answers.timeline ? getTimelineLabel(state.answers.timeline as string) : 'Not set'
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

        {/* Investment DNA or Quiz CTA */}
        {quizCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">Your Investment DNA</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center mb-6">Based on your answers, here's what we found</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {summaryItems.map((item) => (
                <div key={item.label} className="card-surface p-4 md:p-5">
                  <span className="text-sm md:text-base text-muted-foreground block mb-1">{item.label}</span>
                  <span className="text-base md:text-lg font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleRetakeQuiz}
              className="w-full mt-4 py-2.5 md:py-3 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
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
            <h3 className="section-header mb-3 md:text-lg">Personalize</h3>
            <div className="card-surface p-6 md:p-8 text-center">
              <h4 className="font-semibold text-foreground mb-1 md:text-lg">Take the Quiz</h4>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Find themes that match your investment style
              </p>
              <button onClick={handleTakeQuiz} className="btn-primary md:px-8 md:py-3">
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
          <h3 className="section-header mb-3 md:text-lg">🎓 YOUR PROGRESS</h3>
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
              <span className="text-2xl md:text-3xl">🎁</span>
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
