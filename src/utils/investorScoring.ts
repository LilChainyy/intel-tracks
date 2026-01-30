import { QuizScores, QuizAnswer, Persona } from '@/types/investorQuiz';
import { investorQuestions } from '@/data/investorQuizData';
import { getPersona, generatePersonaDescription } from '@/data/personaMatrix';

type RiskLevel = 'safe' | 'balanced' | 'growth' | 'yolo';
type TimelineLevel = 'very_short' | 'short' | 'medium' | 'long';

/**
 * Categorize risk score (0-100) into 4 buckets
 */
function categorizeFinalRisk(avgValue: number): RiskLevel {
  if (avgValue <= 25) return 'safe';
  if (avgValue <= 55) return 'balanced';
  if (avgValue <= 80) return 'growth';
  return 'yolo';
}

/**
 * Categorize timeline score (0-100) into 4 buckets
 */
function categorizeFinalTimeline(avgValue: number): TimelineLevel {
  if (avgValue <= 20) return 'very_short';
  if (avgValue <= 50) return 'short';
  if (avgValue <= 80) return 'medium';
  return 'long';
}

/**
 * Calculate scores from quiz answers
 */
export function calculateScores(answers: Record<number, QuizAnswer>): QuizScores {
  // 1. Calculate risk score (average of Q1-Q3)
  const riskAnswers = [answers[1], answers[2], answers[3]].filter(a => a?.scores.riskValue !== undefined);
  const riskValue = riskAnswers.length > 0
    ? Math.round(riskAnswers.reduce((sum, a) => sum + (a.scores.riskValue || 0), 0) / riskAnswers.length)
    : 50; // Default to balanced if no answers
  const risk = categorizeFinalRisk(riskValue);

  // 2. Calculate timeline score (average of Q4-Q6)
  const timelineAnswers = [answers[4], answers[5], answers[6]].filter(a => a?.scores.timelineValue !== undefined);
  const timelineValue = timelineAnswers.length > 0
    ? Math.round(timelineAnswers.reduce((sum, a) => sum + (a.scores.timelineValue || 0), 0) / timelineAnswers.length)
    : 50; // Default to medium if no answers
  const timeline = categorizeFinalTimeline(timelineValue);

  // 3. Extract sectors from Q7-Q9 (handling both single and multiple selections)
  const allSectors: string[] = [];
  [answers[7], answers[8], answers[9]].forEach(answer => {
    if (!answer) return;

    // Handle array of scores (multiple choice)
    if (Array.isArray(answer.scores)) {
      answer.scores.forEach(score => {
        if (score.sectors) {
          allSectors.push(...score.sectors);
        }
      });
    } else {
      // Handle single score
      if (answer.scores.sectors) {
        allSectors.push(...answer.scores.sectors);
      }
    }
  });

  // Count sector occurrences
  const sectorCounts: Record<string, number> = {};
  allSectors.forEach(sector => {
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
  });

  // Calculate sector weights (as percentages)
  const totalSectorMentions = allSectors.length || 1;
  const sectorWeights: Record<string, number> = {};
  Object.entries(sectorCounts).forEach(([sector, count]) => {
    sectorWeights[sector] = count / totalSectorMentions;
  });

  // Get unique sectors sorted by frequency
  const sectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([sector]) => sector);

  // 4. Extract theme and style preferences from Q8-Q9 (handling both single and multiple selections)
  const themePreferences: string[] = [];

  // Q8 theme preferences
  if (answers[8]) {
    if (Array.isArray(answers[8].scores)) {
      answers[8].scores.forEach(score => {
        if (score.themePreference) {
          themePreferences.push(score.themePreference);
        }
      });
    } else if (answers[8].scores.themePreference) {
      themePreferences.push(answers[8].scores.themePreference);
    }
  }

  // Q9 theme and style preferences
  if (answers[9]) {
    if (Array.isArray(answers[9].scores)) {
      answers[9].scores.forEach(score => {
        if (score.themePreference) {
          themePreferences.push(score.themePreference);
        }
        if (score.stylePreference) {
          themePreferences.push(score.stylePreference);
        }
      });
    } else {
      if (answers[9].scores.themePreference) {
        themePreferences.push(answers[9].scores.themePreference);
      }
      if (answers[9].scores.stylePreference) {
        themePreferences.push(answers[9].scores.stylePreference);
      }
    }
  }

  // 5. Generate persona
  const basePersona = getPersona(risk, timeline);
  const topSectors = sectors.slice(0, 3);
  const persona = generatePersonaDescription(basePersona, topSectors, themePreferences);

  return {
    risk,
    riskValue,
    timeline,
    timelineValue,
    sectors,
    sectorWeights,
    themePreferences,
    personaType: persona.type,
    personaDescription: persona.description,
  };
}

/**
 * Generate full Persona object from calculated scores
 */
export function generatePersona(scores: QuizScores): Persona {
  const basePersona = getPersona(scores.risk, scores.timeline);
  const topSectors = scores.sectors.slice(0, 3);
  return generatePersonaDescription(basePersona, topSectors, scores.themePreferences);
}

/**
 * Convert quiz scores to UserProfile format for playlist matching
 */
export function convertToUserProfile(scores: QuizScores) {
  // Map timeline to the format expected by matchScore
  const timelineMapping: Record<TimelineLevel, number> = {
    very_short: 10,
    short: 35,
    medium: 65,
    long: 90,
  };

  // Map risk to the format expected by matchScore
  const riskMapping: Record<RiskLevel, number> = {
    safe: 15,
    balanced: 45,
    growth: 75,
    yolo: 95,
  };

  return {
    riskTolerance: riskMapping[scores.risk],
    timeHorizon: timelineMapping[scores.timeline],
    sectors: scores.sectorWeights,
    themePreferences: scores.themePreferences,
  };
}

/**
 * Get question by ID
 */
export function getQuestionById(id: number) {
  return investorQuestions.find(q => q.id === id);
}

/**
 * Determine if educational reveal should be shown for a given answer
 */
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
