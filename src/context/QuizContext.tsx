import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizState, UserProfile } from '@/types/quiz';
import { quizQuestions } from '@/data/quizQuestions';

const initialState: QuizState = {
  currentStep: 'welcome',
  currentQuestionIndex: 0,
  answers: {},
  isComplete: false,
  showResults: false
};

type QuizAction =
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; questionId: string; answer: string | string[] }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SHOW_RESULTS' }
  | { type: 'RESET_QUIZ' }
  | { type: 'SKIP_QUIZ' };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return { ...state, currentStep: 'question', currentQuestionIndex: 0 };
    case 'SELECT_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer }
      };
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex >= quizQuestions.length - 1) {
        return { ...state, currentStep: 'results', isComplete: true };
      }
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    case 'PREV_QUESTION':
      if (state.currentQuestionIndex <= 0) {
        return { ...state, currentStep: 'welcome' };
      }
      return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
    case 'COMPLETE_QUIZ':
      return { ...state, isComplete: true, showResults: true };
    case 'SHOW_RESULTS':
      return { ...state, showResults: true };
    case 'RESET_QUIZ':
      return initialState;
    case 'SKIP_QUIZ':
      return { ...state, currentStep: 'welcome', isComplete: false };
    default:
      return state;
  }
}

interface QuizContextType {
  state: QuizState;
  startQuiz: () => void;
  selectAnswer: (questionId: string, answer: string | string[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  skipQuiz: () => void;
  getUserProfile: () => UserProfile | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const startQuiz = () => dispatch({ type: 'START_QUIZ' });
  const selectAnswer = (questionId: string, answer: string | string[]) =>
    dispatch({ type: 'SELECT_ANSWER', questionId, answer });
  const nextQuestion = () => dispatch({ type: 'NEXT_QUESTION' });
  const prevQuestion = () => dispatch({ type: 'PREV_QUESTION' });
  const completeQuiz = () => dispatch({ type: 'COMPLETE_QUIZ' });
  const resetQuiz = () => dispatch({ type: 'RESET_QUIZ' });
  const skipQuiz = () => dispatch({ type: 'SKIP_QUIZ' });

  const getUserProfile = (): UserProfile | null => {
    if (!state.isComplete) return null;
    return {
      risk: state.answers.risk as UserProfile['risk'],
      sectors: state.answers.sectors as string[],
      timeline: state.answers.timeline as UserProfile['timeline'],
      quizCompletedAt: new Date()
    };
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        startQuiz,
        selectAnswer,
        nextQuestion,
        prevQuestion,
        completeQuiz,
        resetQuiz,
        skipQuiz,
        getUserProfile
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
