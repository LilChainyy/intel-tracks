import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { InvestorQuizLanding } from './InvestorQuizLanding';
import { InvestorQuizQuestion } from './InvestorQuizQuestion';
import { InvestorQuizResults } from './InvestorQuizResults';

export function InvestorQuizFlow() {
  const { state } = useInvestorQuiz();

  switch (state.currentStep) {
    case 'landing':
      return <InvestorQuizLanding />;
    case 'question':
    case 'reveal':
      return <InvestorQuizQuestion />;
    case 'results':
      return <InvestorQuizResults />;
    default:
      return <InvestorQuizLanding />;
  }
}
