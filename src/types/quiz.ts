export interface QuizState {
  currentStep: 'welcome' | 'question' | 'results';
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  isComplete: boolean;
  showResults: boolean;
}

export interface QuizOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: QuizOption[];
  selectionType: 'single' | 'multiple';
  maxSelections?: number;
}

export interface UserProfile {
  oddsPreference: string;
  sectors: string[];
  timeHorizon: string;
  investmentStyle: string;
  quizCompletedAt: Date;
}
