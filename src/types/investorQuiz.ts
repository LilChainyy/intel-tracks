export interface QuizOptionScores {
  risk?: 'safe' | 'balanced' | 'growth' | 'yolo';
  riskValue?: number; // 0-100
  timeline?: 'very_short' | 'short' | 'medium' | 'long';
  timelineValue?: number; // 0-100
  sectors?: string[];
  themePreference?: string;
  stylePreference?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  scores: QuizOptionScores;
}

export interface InvestorQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  multipleChoice?: boolean; // If true, user can select multiple options
  educationalReveal?: string;
  showRevealFor?: string[]; // Only show reveal for specific answer IDs
}

export interface QuizScores {
  risk: 'safe' | 'balanced' | 'growth' | 'yolo';
  riskValue: number; // 0-100 average
  timeline: 'very_short' | 'short' | 'medium' | 'long';
  timelineValue: number; // 0-100 average
  sectors: string[]; // All mentioned sectors
  sectorWeights: Record<string, number>; // Sector name -> weight (0-1)
  themePreferences: string[]; // From Q8-Q9
  personaType: string; // e.g., "Wealth Builder"
  personaDescription: string; // Customized description
}

export interface FamousInvestor {
  name: string;
  description: string;
}

export interface Persona {
  type: string; // e.g., "Wealth Builder"
  tagline: string; // Short summary
  description: string; // Full personalized description
  strengths: string[];
  pitfalls: string[];
}

export interface QuizAnswer {
  questionId: number;
  answerId: string | string[]; // Single answer or multiple for multi-choice questions
  scores: QuizOptionScores | QuizOptionScores[]; // Single or multiple scores
}

export interface InvestorQuizState {
  currentStep: 'landing' | 'question' | 'reveal' | 'results';
  currentQuestionIndex: number;
  answers: Record<number, QuizAnswer>;
  calculatedScores: QuizScores | null;
  persona: Persona | null;
  isComplete: boolean;
  showReveal: boolean;
}
