import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { InvestorQuizProgress } from './InvestorQuizProgress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'reveal';
  content: string;
  options?: { id: string; text: string }[];
  isTyping?: boolean;
}

export function InvestorQuizChat() {
  const {
    state,
    currentQuestion,
    totalQuestions,
    progress,
    selectAnswer,
    selectMultipleAnswers,
    prevQuestion,
    continueAfterReveal
  } = useInvestorQuiz();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentAnswer = currentQuestion ? state.answers[currentQuestion.id] : undefined;
  const hasAnswered = !!currentAnswer;
  const isMultipleChoice = currentQuestion?.multipleChoice || false;

  // Reset selections when question changes
  useEffect(() => {
    if (currentQuestion) {
      const currentAnswer = state.answers[currentQuestion.id];
      if (isMultipleChoice && currentAnswer) {
        const answerIds = Array.isArray(currentAnswer.answerId)
          ? currentAnswer.answerId
          : [currentAnswer.answerId];
        setSelectedOptions(answerIds);
      } else {
        setSelectedOptions([]);
      }
    }
  }, [currentQuestion?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, showOptions]);

  // Build conversation from current state
  useEffect(() => {
    if (!currentQuestion) return;

    const newMessages: ChatMessage[] = [];

    // Current question as bot message
    newMessages.push({
      id: `q-${currentQuestion.id}`,
      type: 'bot',
      content: currentQuestion.question,
      options: hasAnswered ? undefined : currentQuestion.options.map(o => ({ id: o.id, text: o.text }))
    });

    // If answered, show user's response
    if (hasAnswered) {
      if (isMultipleChoice && Array.isArray(currentAnswer.answerId)) {
        // Multiple selections
        const selectedTexts = currentAnswer.answerId
          .map(id => currentQuestion.options.find(o => o.id === id)?.text)
          .filter(Boolean);
        newMessages.push({
          id: `a-${currentQuestion.id}`,
          type: 'user',
          content: selectedTexts.join('\n')
        });
      } else {
        // Single selection
        const answerId = Array.isArray(currentAnswer.answerId)
          ? currentAnswer.answerId[0]
          : currentAnswer.answerId;
        const selectedOption = currentQuestion.options.find(o => o.id === answerId);
        if (selectedOption) {
          newMessages.push({
            id: `a-${currentQuestion.id}`,
            type: 'user',
            content: selectedOption.text
          });
        }
      }

      // If showing reveal, add it as bot message
      if (state.showReveal && currentQuestion.educationalReveal) {
        newMessages.push({
          id: `r-${currentQuestion.id}`,
          type: 'reveal',
          content: currentQuestion.educationalReveal
        });
      }
    }

    setMessages(newMessages);

    // Show typing then options with delay
    if (!hasAnswered) {
      setIsTyping(true);
      setShowOptions(false);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setShowOptions(true);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setShowOptions(false);
    }
  }, [currentQuestion, hasAnswered, state.showReveal, state.currentQuestionIndex]);

  if (!currentQuestion) return null;

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;

    if (isMultipleChoice) {
      // Toggle selection for multiple choice
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single choice - immediately select
      setShowOptions(false);
      selectAnswer(currentQuestion.id, optionId);
    }
  };

  const handleContinue = () => {
    if (isMultipleChoice && selectedOptions.length > 0) {
      setShowOptions(false);
      selectMultipleAnswers(currentQuestion.id, selectedOptions);
    }
  };

  const isOptionSelected = (optionId: string) => {
    return selectedOptions.includes(optionId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <InvestorQuizProgress
        currentStep={state.currentQuestionIndex + 1}
        totalSteps={totalQuestions}
        progress={progress}
      />

      <div className="flex-1 flex flex-col pt-16 max-w-3xl mx-auto w-full">
        {/* Back button */}
        <div className="px-4 md:px-6 py-3">
          <motion.button
            onClick={prevQuestion}
            className="flex items-center gap-1 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            Back
          </motion.button>
        </div>

        {/* Chat Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 space-y-4 md:space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 md:px-6 py-3 md:py-4",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : message.type === 'reveal'
                      ? "bg-secondary/80 border border-primary/20 text-foreground"
                      : "bg-secondary text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm md:text-base whitespace-pre-line leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 md:px-6 py-3 md:py-4">
                  <div className="flex gap-1">
                    <motion.span
                      className="w-2 h-2 md:w-2.5 md:h-2.5 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-2 h-2 md:w-2.5 md:h-2.5 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-2 h-2 md:w-2.5 md:h-2.5 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options / Continue Button */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4 md:p-6">
          <AnimatePresence mode="wait">
            {showOptions && currentQuestion && !hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = isOptionSelected(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectOption(option.id)}
                        className={cn(
                          "w-full p-3 md:p-4 text-left text-sm md:text-base rounded-xl border-2 transition-all duration-200",
                          "hover:border-primary/50 hover:bg-secondary/50",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-foreground",
                          isMultipleChoice && "flex items-center gap-3"
                        )}
                      >
                        {isMultipleChoice && (
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                            isSelected ? "border-primary bg-primary" : "border-border"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                          </div>
                        )}
                        <span>{option.text}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Continue button for multiple choice */}
                {isMultipleChoice && (
                  <Button
                    onClick={handleContinue}
                    disabled={selectedOptions.length === 0}
                    className="w-full md:w-auto md:min-w-[200px] md:mx-auto md:block"
                    size="lg"
                  >
                    Continue
                  </Button>
                )}
              </motion.div>
            )}

            {state.showReveal && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={continueAfterReveal}
                className="w-full md:w-auto md:min-w-[200px] md:mx-auto md:block p-3 md:p-4 bg-primary text-primary-foreground rounded-xl font-medium text-sm md:text-base"
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
