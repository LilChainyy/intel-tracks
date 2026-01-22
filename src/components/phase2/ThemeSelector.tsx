import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { getOrderedThemes } from '@/data/themeStoryData';
import { ThemeCard } from './ThemeCard';

export function ThemeSelector() {
  const { state } = useInvestorQuiz();
  const { setCurrentScreen, setCurrentThemeStoryId } = useApp();
  
  const archetypeId = state.archetype?.id || 'momentum_hunter';
  const orderedThemes = getOrderedThemes(archetypeId);

  const handleThemeSelect = (themeId: string) => {
    setCurrentThemeStoryId(themeId);
    setCurrentScreen('phase2-story');
  };

  const handleBack = () => {
    setCurrentScreen('game-map');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Back Button - Fixed below TopNav */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-16 md:top-20 left-4 md:left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </motion.button>
      {/* Header */}
      <div className="px-6 md:px-8 lg:px-12 pt-20 md:pt-16 pb-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
        >
          Themes
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-base text-muted-foreground mt-1"
        >
          Where smart money is flowing
        </motion.p>
      </div>

      {/* Theme Grid */}
      <div className="px-6 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {orderedThemes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <ThemeCard
                theme={theme}
                onClick={() => handleThemeSelect(theme.id)}
                index={index}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
