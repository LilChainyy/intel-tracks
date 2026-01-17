import { motion } from 'framer-motion';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { getOrderedThemes } from '@/data/themeStoryData';
import { ThemeCard } from './ThemeCard';

export function ThemeSelector() {
  const { state } = useInvestorQuiz();
  const { setCurrentScreen, setCurrentThemeStoryId, phase2ViewedThemes } = useApp();
  
  const archetypeId = state.archetype?.id || 'momentum_hunter';
  const orderedThemes = getOrderedThemes(archetypeId);
  
  const availableThemes = orderedThemes;

  const handleThemeSelect = (themeId: string) => {
    setCurrentThemeStoryId(themeId);
    setCurrentScreen('phase2-story');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Pick one that sounds interesting:
          </h1>
          <p className="text-muted-foreground">
            I'll walk you through the story behind it
          </p>
        </motion.div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {availableThemes.map((theme, index) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onClick={() => handleThemeSelect(theme.id)}
              index={index}
            />
          ))}
        </div>

        {/* Viewed indicator */}
        {phase2ViewedThemes.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            You've explored {phase2ViewedThemes.length} of {availableThemes.length} themes
          </motion.p>
        )}
      </div>
    </div>
  );
}
