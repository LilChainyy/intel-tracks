import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { MarketQuestion, generatePercentage } from '@/data/discoveryQuestions';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

interface MarketQuestionCardProps {
  question: MarketQuestion;
  onNext?: () => void;
  hasMore?: boolean;
}

export function MarketQuestionCard({ question, onNext, hasMore }: MarketQuestionCardProps) {
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
            
            <div className="space-y-3 mb-4">
              {question.options.map((option) => {
                const percentage = percentages[option] || 0;
                const isMajority = option === question.popular;
                const isUserPick = selectedOption === option;
                
                return (
                  <div
                    key={option}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                      isUserPick
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    {/* Background bar */}
                    <div className="relative bg-muted/30 p-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`absolute inset-y-0 left-0 ${
                          isMajority ? 'bg-green-500/30' : 'bg-muted/50'
                        }`}
                      />
                      
                      {/* Content */}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isUserPick && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isMajority ? 'bg-green-500' : 'bg-primary'
                            }`}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className={`${isUserPick ? 'font-medium' : ''}`}>
                            {option}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${
                          isMajority ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              {gotPig ? (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.4 }}
                    className="text-2xl"
                  >
                    🐷
                  </motion.span>
                  <span>+1</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {percentages[selectedOption!]}% of users picked this
                </div>
              )}
            </motion.div>

            {hasMore && onNext && (
              <Button 
                onClick={onNext}
                className="w-full"
                variant="default"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
