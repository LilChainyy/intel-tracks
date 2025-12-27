import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { getTodaysMarketPulse, generateAgreementPercentage } from '@/data/discoveryQuestions';
import { TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MarketPulseCard() {
  const { answeredQuestions, markQuestionAnswered, addEdge } = useApp();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  const question = getTodaysMarketPulse();
  const isAnswered = answeredQuestions.has(question.id);

  const handleAnswer = (option: string) => {
    if (isAnswered || showResult) return;
    
    // Generate percentages for all options
    const newPercentages: Record<string, number> = {};
    question.options.forEach((opt) => {
      // First option is usually the "popular" one for market pulse
      newPercentages[opt] = generateAgreementPercentage(opt === question.options[0]);
    });
    
    setSelectedOption(option);
    setPercentages(newPercentages);
    setShowResult(true);
    markQuestionAnswered(question.id);
    addEdge(25);
  };

  if (isAnswered && !showResult) {
    return null; // Hide if already answered in a previous session
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">📊 Market Pulse</span>
      </div>

      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="options"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option}
                className={`p-3 rounded-lg border ${
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
                    {percentages[option]}% 同意
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
