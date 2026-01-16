import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { InvestorQuizState, QuizAnswer, QuizScores, Archetype } from '@/types/investorQuiz';
import { investorQuestions } from '@/data/investorQuizData';
import { calculateScores, determineArchetype, shouldShowReveal } from '@/utils/investorScoring';

const STORAGE_KEY = 'investor_quiz_state';

const initialState: InvestorQuizState = {
  currentStep: 'landing',
  currentQuestionIndex: 0,
  answers: {},
  calculatedScores: null,
  archetype: null,
  isComplete: false,
  showReveal: false
};

type QuizAction =
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; answer: QuizAnswer }
  | { type: 'SHOW_REVEAL' }
  | { type: 'HIDE_REVEAL' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_QUIZ'; scores: QuizScores; archetype: Archetype }
  | { type: 'RESET_QUIZ' }
  | { type: 'RESTORE_STATE'; state: InvestorQuizState };

function quizReducer(state: InvestorQuizState, action: QuizAction): InvestorQuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return { 
        ...state, 
        currentStep: 'question', 
        currentQuestionIndex: 0,
        answers: {},
        isComplete: false,
        showReveal: false
      };
    
    case 'SELECT_ANSWER':
      return {
        ...state,
        answers: { 
          ...state.answers, 
          [action.answer.questionId]: action.answer 
        }
      };
    
    case 'SHOW_REVEAL':
      return { ...state, showReveal: true };
    
    case 'HIDE_REVEAL':
      return { ...state, showReveal: false };
    
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex >= investorQuestions.length - 1) {
        // Quiz complete - will be handled by COMPLETE_QUIZ action
        return state;
      }
      return { 
        ...state, 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        showReveal: false
      };
    
    case 'PREV_QUESTION':
      if (state.currentQuestionIndex <= 0) {
        return { ...state, currentStep: 'landing' };
      }
      return { 
        ...state, 
        currentQuestionIndex: state.currentQuestionIndex - 1,
        showReveal: false
      };
    
    case 'COMPLETE_QUIZ':
      return { 
        ...state, 
        currentStep: 'results',
        isComplete: true,
        calculatedScores: action.scores,
        archetype: action.archetype,
        showReveal: false
      };
    
    case 'RESET_QUIZ':
      return initialState;
    
    case 'RESTORE_STATE':
      return action.state;
    
    default:
      return state;
  }
}

interface InvestorQuizContextType {
  state: InvestorQuizState;
  currentQuestion: typeof investorQuestions[0] | null;
  totalQuestions: number;
  progress: number;
  startQuiz: () => void;
  selectAnswer: (questionId: number, answerId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  continueAfterReveal: () => void;
}

const InvestorQuizContext = createContext<InvestorQuizContextType | undefined>(undefined);

export function InvestorQuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if not complete (allow resuming incomplete quizzes)
        if (!parsed.isComplete) {
          dispatch({ type: 'RESTORE_STATE', state: parsed });
        }
      }
    } catch (e) {
      console.error('Failed to restore quiz state:', e);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save quiz state:', e);
    }
  }, [state]);

  const currentQuestion = state.currentStep === 'question' 
    ? investorQuestions[state.currentQuestionIndex] 
    : null;

  const totalQuestions = investorQuestions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  const startQuiz = () => dispatch({ type: 'START_QUIZ' });

  const selectAnswer = (questionId: number, answerId: string) => {
    const question = investorQuestions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === answerId);
    
    if (!question || !option) return;

    const answer: QuizAnswer = {
      questionId,
      answerId,
      scores: option.scores
    };

    dispatch({ type: 'SELECT_ANSWER', answer });

    // Check if we should show educational reveal
    if (shouldShowReveal(questionId, answerId)) {
      dispatch({ type: 'SHOW_REVEAL' });
    } else {
      // Auto-advance after short delay
      setTimeout(() => {
        if (state.currentQuestionIndex >= investorQuestions.length - 1) {
          // Last question - complete quiz
          const allAnswers = { ...state.answers, [questionId]: answer };
          const scores = calculateScores(allAnswers);
          const archetype = determineArchetype(scores);
          dispatch({ type: 'COMPLETE_QUIZ', scores, archetype });
        } else {
          dispatch({ type: 'NEXT_QUESTION' });
        }
      }, 300);
    }
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex >= investorQuestions.length - 1) {
      completeQuiz();
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const prevQuestion = () => dispatch({ type: 'PREV_QUESTION' });

  const completeQuiz = () => {
    const scores = calculateScores(state.answers);
    const archetype = determineArchetype(scores);
    dispatch({ type: 'COMPLETE_QUIZ', scores, archetype });
  };

  const resetQuiz = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET_QUIZ' });
  };

  const continueAfterReveal = () => {
    dispatch({ type: 'HIDE_REVEAL' });
    if (state.currentQuestionIndex >= investorQuestions.length - 1) {
      completeQuiz();
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  return (
    <InvestorQuizContext.Provider
      value={{
        state,
        currentQuestion,
        totalQuestions,
        progress,
        startQuiz,
        selectAnswer,
        nextQuestion,
        prevQuestion,
        completeQuiz,
        resetQuiz,
        continueAfterReveal
      }}
    >
      {children}
    </InvestorQuizContext.Provider>
  );
}

export function useInvestorQuiz() {
  const context = useContext(InvestorQuizContext);
  if (!context) {
    throw new Error('useInvestorQuiz must be used within an InvestorQuizProvider');
  }
  return context;
}
