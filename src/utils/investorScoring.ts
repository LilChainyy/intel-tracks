import { QuizScores, QuizAnswer, Archetype } from '@/types/investorQuiz';
import { archetypes, investorQuestions } from '@/data/investorQuizData';

export function calculateScores(answers: Record<number, QuizAnswer>): QuizScores {
  const archetypeCounts = {
    bargain_hunter: 0,
    collector: 0,
    safe_player: 0,
    visionary: 0
  };
  
  for (const answer of Object.values(answers)) {
    if (answer.scores.archetype) {
      archetypeCounts[answer.scores.archetype]++;
    }
  }

  // Calculate derived scores based on archetype tendencies
  const totalAnswers = Object.keys(answers).length || 1;
  
  // Risk tolerance: visionary highest, safe_player lowest
  const riskTolerance = Math.round(
    ((archetypeCounts.visionary * 100) + 
     (archetypeCounts.bargain_hunter * 70) + 
     (archetypeCounts.collector * 50) + 
     (archetypeCounts.safe_player * 20)) / totalAnswers
  );

  // Decision style: bargain_hunter most analytical, visionary most intuitive
  const decisionStyle = Math.round(
    ((archetypeCounts.bargain_hunter * 90) + 
     (archetypeCounts.collector * 70) + 
     (archetypeCounts.safe_player * 50) + 
     (archetypeCounts.visionary * 30)) / totalAnswers
  );

  // Time horizon: collector longest, visionary shortest
  const timeHorizon = Math.round(
    ((archetypeCounts.collector * 100) + 
     (archetypeCounts.safe_player * 80) + 
     (archetypeCounts.bargain_hunter * 60) + 
     (archetypeCounts.visionary * 40)) / totalAnswers
  );
  
  return {
    riskTolerance: Math.min(100, Math.max(0, riskTolerance)),
    decisionStyle: Math.min(100, Math.max(0, decisionStyle)),
    timeHorizon: Math.min(100, Math.max(0, timeHorizon)),
    archetypeCounts
  };
}

export function determineArchetype(scores: QuizScores): Archetype {
  const { archetypeCounts } = scores;
  
  // Find the archetype with the highest count
  let maxCount = 0;
  let winningArchetype = 'collector';
  
  Object.entries(archetypeCounts).forEach(([archetype, count]) => {
    if (count > maxCount) {
      maxCount = count;
      winningArchetype = archetype;
    }
  });
  
  // Find and return the matching archetype
  const archetype = archetypes.find(a => a.id === winningArchetype);
  
  if (!archetype) {
    // Fallback to collector if something goes wrong
    return archetypes.find(a => a.id === 'collector')!;
  }

  return archetype;
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
