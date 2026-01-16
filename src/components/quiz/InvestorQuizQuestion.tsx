import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { InvestorQuizProgress } from './InvestorQuizProgress';
import { EducationalReveal } from './EducationalReveal';
import { cn } from '@/lib/utils';

export function InvestorQuizQuestion() {
  const { 
    state, 
    currentQuestion, 
    totalQuestions, 
    progress,
    selectAnswer,
    prevQuestion,
    continueAfterReveal
  } = useInvestorQuiz();

  if (!currentQuestion) return null;

  const currentAnswer = state.answers[currentQuestion.id];
  const hasAnswered = !!currentAnswer;

  return (
    <div className="min-h-screen bg-background">
      <InvestorQuizProgress 
        currentStep={state.currentQuestionIndex + 1}
        totalSteps={totalQuestions}
        progress={progress}
      />

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Back button */}
          <motion.button
            onClick={prevQuestion}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-semibold text-foreground whitespace-pre-line leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswer?.answerId === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => !hasAnswered && selectAnswer(currentQuestion.id, option.id)}
                      disabled={hasAnswered && !isSelected}
                      className={cn(
                        "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                        "hover:border-primary/50 hover:bg-secondary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent",
                        isSelected 
                          ? "border-primary bg-primary/10 text-foreground" 
                          : "border-border bg-background text-foreground"
                      )}
                    >
                      <span className="text-base font-medium">{option.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Educational Reveal */}
              {currentQuestion.educationalReveal && (
                <EducationalReveal 
                  content={currentQuestion.educationalReveal}
                  isVisible={state.showReveal}
                  onContinue={continueAfterReveal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
