import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { getOrderedThemes } from '@/data/themeStoryData';
import { ThemeCard } from './ThemeCard';
import { ArrowRight } from 'lucide-react';

export function ThemeSelector() {
  const { state } = useInvestorQuiz();
  const { setCurrentScreen, setCurrentThemeStoryId, phase2ViewedThemes } = useApp();
  
  const archetypeId = state.archetype?.id || 'momentum_hunter';
  const orderedThemes = getOrderedThemes(archetypeId);
  
  // Filter out already viewed themes for "See Another" flow, but show all initially
  const availableThemes = orderedThemes;

  const handleThemeSelect = (themeId: string) => {
    setCurrentThemeStoryId(themeId);
    setCurrentScreen('phase2-story');
  };

  const handleSkipToAll = () => {
    setCurrentScreen('discovery');
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
            className="text-center text-sm text-muted-foreground mb-4"
          >
            You've explored {phase2ViewedThemes.length} of {availableThemes.length} themes
          </motion.p>
        )}

        {/* Skip Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            onClick={handleSkipToAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Show Me All Themes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
