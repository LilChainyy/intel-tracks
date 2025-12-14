import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'odds_preference',
    question: 'Pick your odds',
    subtitle: 'What matches your comfort zone?',
    selectionType: 'single',
    options: [
      {
        id: 'safe',
        label: 'Steady wins',
        description: 'Lower risk, consistent returns'
      },
      {
        id: 'balanced',
        label: 'Balanced',
        description: 'Mix of stable and growth'
      },
      {
        id: 'growth',
        label: 'Growth',
        description: 'Higher risk for higher reward'
      },
      {
        id: 'yolo',
        label: 'Moon shots',
        description: 'High risk, potential 10x'
      }
    ]
  },
  {
    id: 'sectors',
    question: 'What excites you?',
    subtitle: 'Pick up to 3 sectors',
    selectionType: 'multiple',
    maxSelections: 3,
    options: [
      { id: 'tech', label: 'Tech' },
      { id: 'energy', label: 'Energy' },
      { id: 'healthcare', label: 'Healthcare' },
      { id: 'finance', label: 'Finance' },
      { id: 'consumer', label: 'Consumer' },
      { id: 'industrial', label: 'Industrial' },
      { id: 'space', label: 'Space' },
      { id: 'entertainment', label: 'Entertainment' }
    ]
  },
  {
    id: 'time_horizon',
    question: 'Your timeline?',
    subtitle: 'When do you want results?',
    selectionType: 'single',
    options: [
      {
        id: 'short',
        label: '< 1 year',
        description: 'Quick plays'
      },
      {
        id: 'medium',
        label: '1-3 years',
        description: 'Medium term'
      },
      {
        id: 'long',
        label: '3-5 years',
        description: 'Patient capital'
      },
      {
        id: 'forever',
        label: '5+ years',
        description: 'Buy and hold'
      }
    ]
  },
  {
    id: 'investment_style',
    question: 'Your style?',
    subtitle: 'How do you like to invest?',
    selectionType: 'single',
    options: [
      {
        id: 'passive',
        label: 'Set & forget',
        description: 'Minimal monitoring'
      },
      {
        id: 'casual',
        label: 'Casual',
        description: 'Check weekly'
      },
      {
        id: 'active',
        label: 'Active',
        description: 'Regular research'
      },
      {
        id: 'intense',
        label: 'Intense',
        description: 'Daily tracking'
      }
    ]
  }
];
