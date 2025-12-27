import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { MarketQuestion, generatePercentage } from '@/data/discoveryQuestions';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketQuestionCardProps {
  question: MarketQuestion;
}

export function MarketQuestionCard({ question }: MarketQuestionCardProps) {
  const { markQuestionAnswered, addPigPoint } = useApp();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [gotPig, setGotPig] = useState(false);

  const handleAnswer = (option: string) => {
    if (showResult) return;
    
    // Generate percentages for all options
    const newPercentages: Record<string, number> = {};
    question.options.forEach((opt) => {
      newPercentages[opt] = generatePercentage(opt === question.popular);
    });
    
    setSelectedOption(option);
    setPercentages(newPercentages);
    setShowResult(true);
    
    // Check if user picked the majority answer
    const pickedMajority = option === question.popular;
    setGotPig(pickedMajority);
    
    if (pickedMajority) {
      addPigPoint();
    }
    
    markQuestionAnswered(question.id);
  };

  return (
    <AnimatePresence mode="wait">
      {!showResult ? (
        <motion.div
          key="question"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-5 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            
            <div className="space-y-2">
              {question.options.map((option) => (
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
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-5 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            
            <div className="space-y-2 mb-4">
              {question.options.map((option) => (
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
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2"
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
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
