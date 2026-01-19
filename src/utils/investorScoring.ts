import { QuizScores, QuizAnswer, Archetype } from '@/types/investorQuiz';
import { archetypes, investorQuestions } from '@/data/investorQuizData';

export function calculateScores(answers: Record<number, QuizAnswer>): QuizScores {
  let totalRisk = 0;
  let riskCount = 0;
  let totalDecision = 0;
  let decisionCount = 0;
  let totalHorizon = 0;
  let horizonCount = 0;
  
  const archetypeCounts = {
    deal_maker: 0,
    compounder: 0,
    protector: 0
  };
  
  for (const answer of Object.values(answers)) {
    if (answer.scores.riskTolerance !== undefined) {
      totalRisk += answer.scores.riskTolerance;
      riskCount++;
    }
    if (answer.scores.decisionStyle !== undefined) {
      totalDecision += answer.scores.decisionStyle;
      decisionCount++;
    }
    if (answer.scores.timeHorizon !== undefined) {
      totalHorizon += answer.scores.timeHorizon;
      horizonCount++;
    }
    if (answer.scores.archetype) {
      archetypeCounts[answer.scores.archetype]++;
    }
  }
  
  return {
    riskTolerance: riskCount > 0 ? Math.round(totalRisk / riskCount) : 50,
    decisionStyle: decisionCount > 0 ? Math.round(totalDecision / decisionCount) : 50,
    timeHorizon: horizonCount > 0 ? Math.round(totalHorizon / horizonCount) : 50,
    archetypeCounts
  };
}

export function determineArchetype(scores: QuizScores): Archetype {
  const { archetypeCounts } = scores;
  
  // Find the archetype with the highest count
  let maxCount = 0;
  let winningArchetype: 'deal_maker' | 'compounder' | 'protector' = 'compounder';
  
  if (archetypeCounts.deal_maker > maxCount) {
    maxCount = archetypeCounts.deal_maker;
    winningArchetype = 'deal_maker';
  }
  if (archetypeCounts.compounder > maxCount) {
    maxCount = archetypeCounts.compounder;
    winningArchetype = 'compounder';
  }
  if (archetypeCounts.protector > maxCount) {
    maxCount = archetypeCounts.protector;
    winningArchetype = 'protector';
  }
  
  // Handle ties by checking secondary scores
  if (archetypeCounts.deal_maker === archetypeCounts.compounder && 
      archetypeCounts.deal_maker === maxCount) {
    // Tie between deal_maker and compounder - use risk tolerance to decide
    winningArchetype = scores.riskTolerance >= 70 ? 'deal_maker' : 'compounder';
  } else if (archetypeCounts.compounder === archetypeCounts.protector && 
             archetypeCounts.compounder === maxCount) {
    // Tie between compounder and protector - use time horizon to decide
    winningArchetype = scores.timeHorizon >= 70 ? 'compounder' : 'protector';
  } else if (archetypeCounts.deal_maker === archetypeCounts.protector && 
             archetypeCounts.deal_maker === maxCount) {
    // Tie between deal_maker and protector - use risk tolerance to decide
    winningArchetype = scores.riskTolerance >= 50 ? 'deal_maker' : 'protector';
  }
  
  return archetypes[winningArchetype];
}

export function getQuestionById(id: number) {
  return investorQuestions.find(q => q.id === id);
}

export function shouldShowReveal(questionId: number, answerId: string): boolean {
  const question = getQuestionById(questionId);
  if (!question || !question.educationalReveal) return false;
  
  // If showRevealFor is specified, only show for those answers
  if (question.showRevealFor && question.showRevealFor.length > 0) {
    return question.showRevealFor.includes(answerId);
  }
  
  // Otherwise show for all answers if educationalReveal exists
  return true;
}
