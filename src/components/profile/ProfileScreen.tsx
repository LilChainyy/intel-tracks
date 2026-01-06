import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, Flame, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useQuiz } from '@/context/QuizContext';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

export function ProfileScreen() {
  const { quizCompleted, setCurrentScreen } = useApp();
  const { state, resetQuiz, startQuiz } = useQuiz();
  const { language, setLanguage, t } = useLanguage();

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

  const getRiskLabel = (risk: string) => t(`risk.${risk}`);
  const getTimelineLabel = (timeline: string) => t(`timeline.${timeline}`);
  const getSectorLabel = (sector: string) => t(`sector.${sector}`);

  const summaryItems = quizCompleted
    ? [
        {
          label: t('summary.risk'),
          value: state.answers.risk ? getRiskLabel(state.answers.risk as string) : t('summary.notSet')
        },
        {
          label: t('summary.sectors'),
          value: Array.isArray(state.answers.sectors)
            ? state.answers.sectors.map((s) => getSectorLabel(s)).join(language === 'zh' ? '、' : ', ')
            : t('summary.notSet')
        },
        {
          label: t('summary.timeline'),
          value: state.answers.timeline ? getTimelineLabel(state.answers.timeline as string) : t('summary.notSet')
        }
      ]
    : [];

  // Mock progress data - in production this would come from user_research_xp table
  const progressData = {
    level: 2,
    levelName: t('level.intermediate'),
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
          {t('profile.title')}
        </motion.h1>
      </div>

      {/* Language Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="card-surface p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">{t('profile.language')}</span>
          </div>
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'zh'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </motion.div>

      {/* Investment DNA or Quiz CTA */}
      {quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-foreground text-center mb-2">{t('profile.investmentDna')}</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">{t('profile.investmentDnaDesc')}</p>
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
            {t('profile.retakeQuiz')}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3">{t('profile.personalize')}</h3>
          <div className="card-surface p-6 text-center">
            <h4 className="font-semibold text-foreground mb-1">{t('profile.takeQuiz')}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('profile.takeQuizDesc')}
            </p>
            <button onClick={handleTakeQuiz} className="btn-primary">
              {t('profile.startQuiz')}
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
        <h3 className="section-header mb-3">{t('profile.progress')}</h3>
        <div className="card-surface p-5">
          {/* Level Display */}
          <div className="text-center mb-4">
            <p className="text-lg font-bold text-foreground">
              {t('profile.level')} {progressData.level}: {progressData.levelName}
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <Progress value={xpProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} {t('profile.xpToLevel')} {progressData.level + 1}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.companiesResearched}</p>
              <p className="text-xs text-muted-foreground">{t('profile.companiesResearched')}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.theoriesCreated}</p>
              <p className="text-xs text-muted-foreground">{t('profile.theoriesCreated')}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.daysActive}</p>
              <p className="text-xs text-muted-foreground">{t('profile.daysActive')}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                {progressData.currentStreak} {t('profile.days')} <Flame className="w-4 h-4 text-orange-500" />
              </p>
              <p className="text-xs text-muted-foreground">{t('profile.currentStreak')}</p>
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
              <p className="font-semibold text-foreground">{t('profile.rewardsStore')}</p>
              <p className="text-sm text-muted-foreground">{t('profile.rewardsStoreDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>
    </div>
  );
}
