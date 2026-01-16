import { QuizScores, QuizAnswer, Archetype } from '@/types/investorQuiz';
import { archetypes, investorQuestions } from '@/data/investorQuizData';

// Questions that contribute to each score category
const RISK_TOLERANCE_QUESTIONS = [2, 7, 9, 11];
const KNOWLEDGE_QUESTIONS = [3, 4, 5];
const DECISION_STYLE_QUESTIONS = [1, 6, 7];
const TIME_HORIZON_QUESTIONS = [5, 10, 11];
const MOTIVATION_QUESTION = 8;

function averageScores(answers: Record<number, QuizAnswer>, questionIds: number[], scoreKey: keyof QuizAnswer['scores']): number {
  const validScores: number[] = [];
  
  for (const qId of questionIds) {
    const answer = answers[qId];
    if (answer && answer.scores[scoreKey] !== undefined) {
      validScores.push(answer.scores[scoreKey] as number);
    }
  }
  
  if (validScores.length === 0) return 50; // Default to middle
  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
}

export function calculateScores(answers: Record<number, QuizAnswer>): QuizScores {
  const riskTolerance = averageScores(answers, RISK_TOLERANCE_QUESTIONS, 'riskTolerance');
  const knowledge = averageScores(answers, KNOWLEDGE_QUESTIONS, 'knowledge');
  const decisionStyle = averageScores(answers, DECISION_STYLE_QUESTIONS, 'decisionStyle');
  const timeHorizon = averageScores(answers, TIME_HORIZON_QUESTIONS, 'timeHorizon');
  
  // Motivation comes from question 8 only
  const motivationAnswer = answers[MOTIVATION_QUESTION];
  const motivation = (motivationAnswer?.scores?.motivation as QuizScores['motivation']) || 'balanced';
  
  return {
    riskTolerance,
    knowledge,
    decisionStyle,
    timeHorizon,
    motivation
  };
}

export function determineArchetype(scores: QuizScores): Archetype {
  const { riskTolerance, knowledge, decisionStyle, timeHorizon } = scores;
  
  // Momentum Hunter: High risk (70+), impulsive (0-40), short-term (0-40)
  if (riskTolerance >= 70 && decisionStyle <= 40 && timeHorizon <= 40) {
    return archetypes.momentum_hunter;
  }
  
  // Strategic Analyst: Moderate risk (40-70), analytical (70+), medium-long (50+)
  if (riskTolerance >= 40 && riskTolerance <= 70 && decisionStyle >= 70 && timeHorizon >= 50) {
    return archetypes.strategic_analyst;
  }
  
  // Cautious Builder: Low risk (0-40), analytical (60+), long-term (70+)
  if (riskTolerance <= 40 && decisionStyle >= 60 && timeHorizon >= 70) {
    return archetypes.cautious_builder;
  }
  
  // Curious Learner: Low knowledge (0-50), any other scores
  if (knowledge <= 50) {
    return archetypes.curious_learner;
  }
  
  // Calculated Risk-Taker: High risk (70+), analytical (70+), any horizon
  if (riskTolerance >= 70 && decisionStyle >= 70) {
    return archetypes.calculated_risk_taker;
  }
  
  // Balanced Realist: Everything moderate (40-70 range) - fallback
  return archetypes.balanced_realist;
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
