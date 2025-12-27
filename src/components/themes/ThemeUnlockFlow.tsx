import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { themesData, generatePercentage } from '@/data/discoveryQuestions';
import { playlists } from '@/data/playlists';
import { ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeUnlockFlow() {
  const { 
    currentUnlockingTheme,
    setCurrentUnlockingTheme,
    setCurrentScreen,
    themeQuestionProgress,
    advanceThemeQuestion,
    unlockTheme,
    addPigPoint,
    markQuestionAnswered,
    setSelectedPlaylist
  } = useApp();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [gotPig, setGotPig] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const theme = themesData.find(t => t.themeId === currentUnlockingTheme);
  if (!theme) {
    return null;
  }

  const currentQuestionIndex = themeQuestionProgress[theme.themeId] || 0;
  const currentQuestion = theme.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === theme.questions.length - 1;

  const handleBack = () => {
    setCurrentUnlockingTheme(null);
    setCurrentScreen('themes');
  };

  const handleAnswer = (option: string) => {
    if (showResult) return;
    
    const newPercentages: Record<string, number> = {};
    currentQuestion.options.forEach((opt) => {
      newPercentages[opt] = generatePercentage(opt === currentQuestion.popular);
    });
    
    setSelectedOption(option);
    setPercentages(newPercentages);
    setShowResult(true);
    
    const pickedMajority = option === currentQuestion.popular;
    setGotPig(pickedMajority);
    
    if (pickedMajority) {
      addPigPoint();
    }
    
    markQuestionAnswered(currentQuestion.id);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Unlock theme
      unlockTheme(theme.themeId);
      setJustUnlocked(true);
    } else {
      // Advance to next question
      advanceThemeQuestion(theme.themeId);
      setSelectedOption(null);
      setShowResult(false);
      setPercentages({});
      setGotPig(false);
    }
  };

  const handleViewTheme = () => {
    const playlist = playlists.find(p => p.id === theme.themeId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentUnlockingTheme(null);
      setCurrentScreen('playlist');
    }
  };

  const handleBackToThemes = () => {
    setCurrentUnlockingTheme(null);
    setCurrentScreen('themes');
  };

  if (justUnlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-2">Theme Unlocked!</h1>
          <p className="text-lg mb-1">{theme.icon} {theme.themeName}</p>
          <p className="text-muted-foreground mb-8">
            现在可以查看投资主题详情了
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={handleViewTheme}
            >
              查看主题详情
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleBackToThemes}
            >
              返回主题列表
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold">{theme.icon} {theme.themeName}</h1>
            <p className="text-xs text-muted-foreground">
              问题 {currentQuestionIndex + 1} / {theme.questions.length}
            </p>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-2 px-4 pb-3">
          {theme.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentQuestionIndex
                  ? 'bg-primary'
                  : i === currentQuestionIndex
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-5 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
              
              {!showResult ? (
                <div className="space-y-2">
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
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedOption === option
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={selectedOption === option ? 'font-medium' : ''}>
                            {option}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {percentages[option]}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mb-4"
                  >
                    {gotPig ? (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span className="text-2xl">🐷</span>
                        <span>+1</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {percentages[selectedOption!]}% 的用户选了同样的答案
                      </div>
                    )}
                  </motion.div>

                  <Button className="w-full" onClick={handleNext}>
                    {isLastQuestion ? '解锁主题' : '下一题'}
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
