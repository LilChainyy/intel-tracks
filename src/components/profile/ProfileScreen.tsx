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
    <div className="min-h-screen pb-24 md:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="pt-12 md:pt-8 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
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
          <div className="card-surface p-4 md:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
              <span className="text-foreground md:text-lg">{t('profile.language')}</span>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm md:text-base font-medium transition-all ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm md:text-base font-medium transition-all ${
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
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">{t('profile.investmentDna')}</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center mb-6">{t('profile.investmentDnaDesc')}</p>
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
            <h3 className="section-header mb-3 md:text-lg">{t('profile.personalize')}</h3>
            <div className="card-surface p-6 md:p-8 text-center">
              <h4 className="font-semibold text-foreground mb-1 md:text-lg">{t('profile.takeQuiz')}</h4>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                {t('profile.takeQuizDesc')}
              </p>
              <button onClick={handleTakeQuiz} className="btn-primary md:px-8 md:py-3">
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
          <h3 className="section-header mb-3 md:text-lg">{t('profile.progress')}</h3>
          <div className="card-surface p-5 md:p-6">
            {/* Level Display */}
            <div className="text-center mb-4">
              <p className="text-lg md:text-xl font-bold text-foreground">
                {t('profile.level')} {progressData.level}: {progressData.levelName}
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4 md:mb-6">
              <Progress value={xpProgress} className="h-3 md:h-4" />
              <p className="text-sm md:text-base text-muted-foreground text-center mt-2">
                {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} {t('profile.xpToLevel')} {progressData.level + 1}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.companiesResearched}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{t('profile.companiesResearched')}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.theoriesCreated}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{t('profile.theoriesCreated')}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{progressData.daysActive}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{t('profile.daysActive')}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                  {progressData.currentStreak} {t('profile.days')} <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">{t('profile.currentStreak')}</p>
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
                <p className="font-semibold text-foreground md:text-lg">{t('profile.rewardsStore')}</p>
                <p className="text-sm md:text-base text-muted-foreground">{t('profile.rewardsStoreDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
