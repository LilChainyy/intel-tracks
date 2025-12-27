import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { getCurrentThemeDiscovery, generateAgreementPercentage } from '@/data/discoveryQuestions';
import { Sparkles, Zap, ArrowRight, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playlists } from '@/data/playlists';

export function ThemeQuestionCard() {
  const { 
    answeredQuestions, 
    markQuestionAnswered, 
    addEdge,
    currentThemeQuestionIndex,
    advanceThemeQuestion,
    discoverTheme,
    discoveredThemes,
    trackTheme,
    trackedThemes,
    setCurrentScreen,
    setSelectedPlaylist
  } = useApp();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [showDiscovery, setShowDiscovery] = useState(false);

  const themeData = getCurrentThemeDiscovery();
  const currentQuestion = themeData.questions[currentThemeQuestionIndex];
  const isLastQuestion = currentThemeQuestionIndex >= themeData.questions.length - 1;
  const isThemeDiscovered = discoveredThemes.includes(themeData.themeId);
  const isThemeTracked = trackedThemes.includes(themeData.themeId);

  // Check if current question is already answered
  const isCurrentQuestionAnswered = currentQuestion && answeredQuestions.has(currentQuestion.id);

  useEffect(() => {
    // If all questions are answered, show discovery
    if (isLastQuestion && isCurrentQuestionAnswered) {
      setShowDiscovery(true);
    }
  }, [isLastQuestion, isCurrentQuestionAnswered]);

  const handleAnswer = (option: string) => {
    if (!currentQuestion || showResult) return;
    
    // Generate percentages
    const newPercentages: Record<string, number> = {};
    currentQuestion.options.forEach((opt) => {
      newPercentages[opt] = generateAgreementPercentage(opt === currentQuestion.popular);
    });
    
    setSelectedOption(option);
    setPercentages(newPercentages);
    setShowResult(true);
    markQuestionAnswered(currentQuestion.id);
    addEdge(25);
  };

  const handleContinue = () => {
    if (isLastQuestion) {
      discoverTheme(themeData.themeId);
      setShowDiscovery(true);
    } else {
      advanceThemeQuestion();
      setSelectedOption(null);
      setShowResult(false);
      setPercentages({});
    }
  };

  const handleViewTheme = () => {
    const playlist = playlists.find(p => p.id === themeData.themeId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentScreen('playlist');
    }
  };

  const handleTrackTheme = () => {
    trackTheme(themeData.themeId);
  };

  // If theme is already discovered, show the discovery card
  if (isThemeDiscovered || showDiscovery) {
    return (
      <Card className="p-4 bg-card border-border overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-2">🎉 You discovered</h3>
          <p className="text-2xl font-bold text-primary mb-6">{themeData.themeName}</p>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleViewTheme} className="gap-2">
              View Theme
              <ArrowRight className="w-4 h-4" />
            </Button>
            {!isThemeTracked && (
              <Button variant="outline" onClick={handleTrackTheme} className="gap-2">
                <Bookmark className="w-4 h-4" />
                Track It
              </Button>
            )}
            {isThemeTracked && (
              <Button variant="outline" disabled className="gap-2">
                <Bookmark className="w-4 h-4 fill-current" />
                Tracking
              </Button>
            )}
          </div>
        </motion.div>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Theme Discovery</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {currentThemeQuestionIndex + 1}/{themeData.questions.length}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="options"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => {
              const isPopular = option === currentQuestion.popular;
              return (
                <div
                  key={option}
                  className={`p-3 rounded-lg border ${
                    selectedOption === option
                      ? 'border-primary bg-primary/5'
                      : isPopular
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={selectedOption === option || isPopular ? 'font-medium' : ''}>
                      {option}
                      {isPopular && <span className="ml-2 text-green-500">✓</span>}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {percentages[option]}% 同意
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-primary font-medium"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>+25 Edge</span>
            </motion.div>

            <Button onClick={handleContinue} className="w-full mt-2">
              {isLastQuestion ? 'See what you discovered' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
