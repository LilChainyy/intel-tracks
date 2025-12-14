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
  risk: 'safe' | 'balanced' | 'growth' | 'yolo';
  sectors: string[];
  timeline: 'short' | 'medium' | 'long' | 'forever';
  quizCompletedAt: Date;
}
