import { useApp } from '@/context/AppContext';
import { MarketQuestionCard } from './MarketQuestionCard';
import { PigProgressBar } from './PigProgressBar';
import { marketQuestions } from '@/data/discoveryQuestions';

export function HomeFeed() {
  const { answeredQuestions, canAnswerMoreToday, todayAnsweredCount } = useApp();

  const nextQuestion = marketQuestions.find(q => !answeredQuestions.has(q.id));
  const allQuestionsAnswered = !nextQuestion;
  const reachedDailyLimit = !canAnswerMoreToday;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PigProgressBar />
      <div className="p-4 pt-2">
        {reachedDailyLimit || allQuestionsAnswered ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🐷</span>
            <h2 className="text-xl font-semibold mb-2">
              {reachedDailyLimit ? '今天的问题已答完!' : '所有问题已答完!'}
            </h2>
            <p className="text-muted-foreground">
              {reachedDailyLimit ? '明天再来继续攒 🐷' : '新问题即将上线'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              今天已回答: {todayAnsweredCount}/10
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center mb-4">
              今天还能回答 {10 - todayAnsweredCount} 个问题
            </div>
            {nextQuestion && <MarketQuestionCard question={nextQuestion} />}
          </div>
        )}
      </div>
    </div>
  );
}
