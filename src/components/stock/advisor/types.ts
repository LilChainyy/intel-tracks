// Types for the AI Advisor Chat system

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SuggestedQuestion {
  text: string;
  category: 'understanding' | 'risks' | 'valuation';
}

export interface SubsectionProgress {
  questionsAsked: number;
  summaryPoints: string[];
}

export interface SectionProgress {
  subsections: {
    [key: string]: SubsectionProgress;
  };
}

export interface LearningProgress {
  understanding: {
    company_fundamental: SubsectionProgress;
    financial_health: SubsectionProgress;
    industry_context: SubsectionProgress;
  };
  risks: {
    company_risks: SubsectionProgress;
    external_risks: SubsectionProgress;
    investment_risks: SubsectionProgress;
  };
  valuation: {
    current_price: SubsectionProgress;
    company_valuation: SubsectionProgress;
    expected_returns: SubsectionProgress;
  };
}

export interface ThesisChoice {
  stance: 'bullish' | 'neutral' | 'bearish' | 'custom';
  customText?: string;
  savedAt: Date;
}

export const INITIAL_PROGRESS: LearningProgress = {
  understanding: {
    company_fundamental: { questionsAsked: 0, summaryPoints: [] },
    financial_health: { questionsAsked: 0, summaryPoints: [] },
    industry_context: { questionsAsked: 0, summaryPoints: [] },
  },
  risks: {
    company_risks: { questionsAsked: 0, summaryPoints: [] },
    external_risks: { questionsAsked: 0, summaryPoints: [] },
    investment_risks: { questionsAsked: 0, summaryPoints: [] },
  },
  valuation: {
    current_price: { questionsAsked: 0, summaryPoints: [] },
    company_valuation: { questionsAsked: 0, summaryPoints: [] },
    expected_returns: { questionsAsked: 0, summaryPoints: [] },
  },
};

export const calculateSubsectionProgress = (subsection: SubsectionProgress): number => {
  // Each subsection is 100% complete after 5 questions
  return Math.min(subsection.questionsAsked / 5, 1) * 100;
};

export const calculateSectionProgress = (section: { [key: string]: SubsectionProgress }): number => {
  const subsections = Object.values(section);
  // Count total questions asked across all subsections
  const totalQuestions = subsections.reduce((sum, sub) => sum + sub.questionsAsked, 0);
  // Each category has 5 questions total = 100%
  // So progress = (totalQuestions / 5) * 100
  return Math.min((totalQuestions / 5) * 100, 100);
};

export const calculateOverallProgress = (progress: LearningProgress): number => {
  const understandingProgress = calculateSectionProgress(progress.understanding);
  const risksProgress = calculateSectionProgress(progress.risks);
  const valuationProgress = calculateSectionProgress(progress.valuation);
  return (understandingProgress + risksProgress + valuationProgress) / 3;
};
