import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'odds_preference',
    emoji: '🎲',
    question: 'Pick your odds',
    subtitle: 'What matches your comfort zone?',
    selectionType: 'single',
    options: [
      {
        id: 'safe',
        emoji: '🛡️',
        label: 'Steady wins',
        description: 'Lower risk, consistent returns'
      },
      {
        id: 'balanced',
        emoji: '⚖️',
        label: 'Balanced',
        description: 'Mix of stable and growth'
      },
      {
        id: 'growth',
        emoji: '📈',
        label: 'Growth',
        description: 'Higher risk for higher reward'
      },
      {
        id: 'yolo',
        emoji: '🚀',
        label: 'Moon shots',
        description: 'High risk, potential 10x'
      }
    ]
  },
  {
    id: 'sectors',
    emoji: '🏢',
    question: 'What excites you?',
    subtitle: 'Pick up to 3 sectors',
    selectionType: 'multiple',
    maxSelections: 3,
    options: [
      { id: 'tech', emoji: '💻', label: 'Tech' },
      { id: 'energy', emoji: '⚡', label: 'Energy' },
      { id: 'healthcare', emoji: '🏥', label: 'Healthcare' },
      { id: 'finance', emoji: '🏦', label: 'Finance' },
      { id: 'consumer', emoji: '🛍️', label: 'Consumer' },
      { id: 'industrial', emoji: '🏭', label: 'Industrial' },
      { id: 'space', emoji: '🚀', label: 'Space' },
      { id: 'entertainment', emoji: '🎬', label: 'Entertainment' }
    ]
  },
  {
    id: 'time_horizon',
    emoji: '⏰',
    question: 'Your timeline?',
    subtitle: 'When do you want results?',
    selectionType: 'single',
    options: [
      {
        id: 'short',
        emoji: '⚡',
        label: '< 1 year',
        description: 'Quick plays'
      },
      {
        id: 'medium',
        emoji: '📅',
        label: '1-3 years',
        description: 'Medium term'
      },
      {
        id: 'long',
        emoji: '🏔️',
        label: '3-5 years',
        description: 'Patient capital'
      },
      {
        id: 'forever',
        emoji: '♾️',
        label: '5+ years',
        description: 'Buy and hold'
      }
    ]
  },
  {
    id: 'investment_style',
    emoji: '🧠',
    question: 'Your style?',
    subtitle: 'How do you like to invest?',
    selectionType: 'single',
    options: [
      {
        id: 'passive',
        emoji: '😴',
        label: 'Set & forget',
        description: 'Minimal monitoring'
      },
      {
        id: 'casual',
        emoji: '📱',
        label: 'Casual',
        description: 'Check weekly'
      },
      {
        id: 'active',
        emoji: '📊',
        label: 'Active',
        description: 'Regular research'
      },
      {
        id: 'intense',
        emoji: '🔥',
        label: 'Intense',
        description: 'Daily tracking'
      }
    ]
  }
];
