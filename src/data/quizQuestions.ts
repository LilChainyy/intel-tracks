import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'risk',
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
    id: 'timeline',
    question: 'Your timeline?',
    subtitle: 'When do you want results?',
    selectionType: 'single',
    options: [
      {
        id: 'short',
        label: '< 1 year'
      },
      {
        id: 'medium',
        label: '1-3 years'
      },
      {
        id: 'long',
        label: '3-5 years'
      },
      {
        id: 'forever',
        label: '5+ years'
      }
    ]
  }
];
