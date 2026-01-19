export interface QuizOptionScores {
  riskTolerance?: number;
  decisionStyle?: number;
  timeHorizon?: number;
  archetype?: 'deal_maker' | 'compounder' | 'protector';
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
  educationalReveal?: string;
  showRevealFor?: string[]; // Only show reveal for specific answer IDs
}

export interface QuizScores {
  riskTolerance: number;    // 0-100
  decisionStyle: number;    // 0-100 (0=impulsive, 100=analytical)
  timeHorizon: number;      // 0-100 (0=short-term, 100=long-term)
  archetypeCounts: {
    deal_maker: number;
    compounder: number;
    protector: number;
  };
}

export interface FamousInvestor {
  name: string;
  description: string;
}

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  expectedPercentage: number;
  famousInvestors: FamousInvestor[];
  fallback: string;
  strengths: string[];
  pitfalls: string[];
}

export interface QuizAnswer {
  questionId: number;
  answerId: string;
  scores: QuizOptionScores;
}

export interface InvestorQuizState {
  currentStep: 'landing' | 'question' | 'reveal' | 'results';
  currentQuestionIndex: number;
  answers: Record<number, QuizAnswer>;
  calculatedScores: QuizScores | null;
  archetype: Archetype | null;
  isComplete: boolean;
  showReveal: boolean;
}
