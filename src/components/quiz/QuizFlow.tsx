import { useQuiz } from '@/context/QuizContext';
import { QuizWelcome } from './QuizWelcome';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';

export function QuizFlow() {
  const { state } = useQuiz();

  switch (state.currentStep) {
    case 'welcome':
      return <QuizWelcome />;
    case 'question':
      return <QuizQuestion />;
    case 'results':
      return <QuizResults />;
    default:
      return <QuizWelcome />;
  }
}
