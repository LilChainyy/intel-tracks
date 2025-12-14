import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import { quizQuestions } from '@/data/quizQuestions';
import { CircleUI } from './CircleUI';
import { GridSelector } from './GridSelector';

export function QuizQuestion() {
  const { state, selectAnswer, nextQuestion, prevQuestion } = useQuiz();
  const currentQuestion = quizQuestions[state.currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  const currentAnswer = state.answers[currentQuestion.id];
  const isMultiple = currentQuestion.selectionType === 'multiple';

  const hasAnswer = isMultiple
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : Boolean(currentAnswer);

  const handleSingleSelect = (id: string) => {
    selectAnswer(currentQuestion.id, id);
  };

  const handleMultipleToggle = (id: string) => {
    const current = (currentAnswer as string[]) || [];
    if (current.includes(id)) {
      selectAnswer(currentQuestion.id, current.filter((i) => i !== id));
    } else {
      selectAnswer(currentQuestion.id, [...current, id]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevQuestion}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <span className="text-sm text-muted-foreground">
          Step {state.currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-8">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {isMultiple ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl mb-4"
            >
              {currentQuestion.emoji}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-foreground text-center mb-2"
            >
              {currentQuestion.question}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-muted-foreground text-center mb-8"
            >
              {currentQuestion.subtitle}
            </motion.p>
            <GridSelector
              options={currentQuestion.options}
              selectedIds={(currentAnswer as string[]) || []}
              maxSelections={currentQuestion.maxSelections || 3}
              onToggle={handleMultipleToggle}
            />
          </>
        ) : (
          <>
            <CircleUI
              emoji={currentQuestion.emoji}
              question={currentQuestion.question}
              options={currentQuestion.options}
              selectedId={currentAnswer as string}
              onSelect={handleSingleSelect}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground text-center mt-6"
            >
              {currentQuestion.subtitle}
            </motion.p>
          </>
        )}
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <button
          onClick={nextQuestion}
          disabled={!hasAnswer}
          className={hasAnswer ? 'btn-primary' : 'btn-disabled'}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
