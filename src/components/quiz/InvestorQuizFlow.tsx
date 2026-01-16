import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { InvestorQuizLanding } from './InvestorQuizLanding';
import { InvestorQuizChat } from './InvestorQuizChat';
import { InvestorQuizResults } from './InvestorQuizResults';

export function InvestorQuizFlow() {
  const { state } = useInvestorQuiz();

  switch (state.currentStep) {
    case 'landing':
      return <InvestorQuizLanding />;
    case 'question':
    case 'reveal':
      return <InvestorQuizChat />;
    case 'results':
      return <InvestorQuizResults />;
    default:
      return <InvestorQuizLanding />;
  }
}
