import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Brain, Bot, User } from 'lucide-react';
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
      {/* Advisor-style header with integrated progress */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex flex-col items-center gap-1 py-4 px-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Discover Your Investor DNA</h2>
          <p className="text-xs text-muted-foreground">Question {state.currentQuestionIndex + 1} of {totalQuestions}</p>
        </div>
        <InvestorQuizProgress
          currentStep={state.currentQuestionIndex + 1}
          totalSteps={totalQuestions}
          progress={progress}
          inline
        />
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
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

        {/* Chat Messages with avatar circles (Advisor style) */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
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
                  "flex gap-3",
                  message.type === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.type === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground"
                      : message.type === 'reveal'
                      ? "bg-muted text-foreground border border-primary/20"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator with Bot avatar */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <motion.span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options area - Advisor style (bg-muted/30, chip styling) */}
        <div className="border-t border-border bg-muted/30 p-4">
          <AnimatePresence mode="wait">
            {showOptions && currentQuestion && !hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = isOptionSelected(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectOption(option.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-sm transition-all duration-200",
                          "hover:bg-muted transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-foreground",
                          isMultipleChoice && "flex items-center gap-2"
                        )}
                      >
                        {isMultipleChoice && (
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                            isSelected ? "border-primary bg-primary" : "border-border"
                          )}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                        )}
                        <span>{option.text}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {isMultipleChoice && (
                  <Button
                    onClick={handleContinue}
                    disabled={selectedOptions.length === 0}
                    className="w-full mt-2"
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
                className="w-full p-3 md:p-4 bg-primary text-primary-foreground rounded-full font-medium text-sm md:text-base"
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
