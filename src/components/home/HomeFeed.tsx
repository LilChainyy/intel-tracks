import { useApp } from '@/context/AppContext';
import { MarketQuestionCard } from './MarketQuestionCard';
import { PigProgressBar } from './PigProgressBar';
import { marketQuestions } from '@/data/discoveryQuestions';
import { useState } from 'react';

const DAILY_LIMIT = 10;

export function HomeFeed() {
  const { answeredQuestions, dailyData } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter out already answered questions
  const availableQuestions = marketQuestions.filter(
    q => !answeredQuestions.includes(q.id)
  );
  
  const dailyCount = dailyData?.questionsAnsweredToday || 0;
  const questionsRemaining = Math.max(DAILY_LIMIT - dailyCount, 0);
  
  // Get current question
  const currentQuestion = availableQuestions[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < availableQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PigProgressBar />
      <div className="p-4 pt-2">
        {questionsRemaining === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🐷</span>
            <h2 className="text-xl font-semibold mb-2">Done for today!</h2>
            <p className="text-muted-foreground">Come back tomorrow for more 🐷</p>
            <p className="text-sm text-muted-foreground mt-2">
              Answered today: {dailyCount}/{DAILY_LIMIT}
            </p>
          </div>
        ) : !currentQuestion ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🐷</span>
            <h2 className="text-xl font-semibold mb-2">All questions answered!</h2>
            <p className="text-muted-foreground">New questions coming soon</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center mb-4">
              {questionsRemaining} questions left today
            </div>
            <MarketQuestionCard 
              key={currentQuestion.id} 
              question={currentQuestion} 
              onNext={handleNext}
              hasMore={currentIndex < availableQuestions.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
