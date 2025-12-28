import { useApp } from '@/context/AppContext';
import { MarketQuestionCard } from './MarketQuestionCard';
import { PigProgressBar } from './PigProgressBar';
import { marketQuestions } from '@/data/discoveryQuestions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function HomeFeed() {
  const { resetAllProgress } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get current question using modulo to cycle infinitely
  const currentQuestion = marketQuestions[currentIndex % marketQuestions.length];
  
  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    resetAllProgress();
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PigProgressBar />
      <div className="p-4 pt-2">
        <div className="text-sm text-muted-foreground text-center mb-4">
          Question {(currentIndex % marketQuestions.length) + 1} of {marketQuestions.length}
        </div>
        <MarketQuestionCard 
          key={currentIndex} 
          question={currentQuestion} 
          onNext={handleNext}
        />
        
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
