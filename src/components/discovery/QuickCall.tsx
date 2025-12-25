import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type QuickCallAnswer = 'yes' | 'no' | 'inline';

interface QuickCallData {
  id: string;
  event: string;
  context: string;
  question: string;
  resultTime: string;
  // Result data for when it resolves
  result?: {
    actualOutcome: 'yes' | 'no' | 'inline';
    headline: string;
    insight?: string;
  };
}

// Hardcoded example quick calls
const quickCalls: QuickCallData[] = [
  {
    id: 'nvda-earnings',
    event: 'NVDA reports earnings in 2 hours',
    context: 'Consensus: $28B revenue',
    question: 'Will they beat?',
    resultTime: 'Result at 4:30pm ET',
    result: {
      actualOutcome: 'yes',
      headline: 'NVDA beat by 8%',
      insight: 'Stock still dropped 4% after hours. The beat was priced in.',
    },
  },
  {
    id: 'fed-decision',
    event: 'Fed rate decision at 2pm ET',
    context: 'Markets pricing 25bp cut',
    question: 'Will they cut?',
    resultTime: 'Result at 2:00pm ET',
    result: {
      actualOutcome: 'no',
      headline: 'Fed held rates steady',
    },
  },
  {
    id: 'tsla-deliveries',
    event: 'TSLA Q4 deliveries report tomorrow',
    context: 'Analyst estimate: 485K units',
    question: 'Will they beat estimates?',
    resultTime: 'Result tomorrow 8am ET',
    result: {
      actualOutcome: 'yes',
      headline: 'TSLA delivered 495K units',
      insight: 'Beat estimates by 2%, stock rallied 6% pre-market.',
    },
  },
];

function getAnswerLabel(answer: QuickCallAnswer) {
  switch (answer) {
    case 'yes': return 'Yes';
    case 'no': return 'No';
    case 'inline': return 'In-line';
  }
}

export function QuickCall() {
  const [answers, setAnswers] = useState<Record<string, QuickCallAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentCall = quickCalls[currentIndex];
  const hasAnswered = answers[currentCall.id];
  const userAnswer = answers[currentCall.id];
  const result = currentCall.result;
  const isCorrect = result && userAnswer === result.actualOutcome;

  // Auto-trigger result after 10 seconds for testing
  useEffect(() => {
    if (hasAnswered && !showResult) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, showResult]);

  const handleAnswer = (answer: QuickCallAnswer) => {
    setAnswers(prev => ({ ...prev, [currentCall.id]: answer }));
  };

  const handleCloseResult = () => {
    setShowResult(false);
    // Move to next quick call if available
    if (currentIndex < quickCalls.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const triggerResult = () => {
    if (hasAnswered) {
      setShowResult(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="px-6 mb-6"
      >
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground">Quick Call</h2>
          <p className="text-xs text-muted-foreground">Resolves today</p>
        </div>

        <div className="card-surface p-4">
          {/* Event */}
          <p className="text-sm font-medium text-foreground mb-1">{currentCall.event}</p>
          
          {/* Context */}
          <p className="text-xs text-muted-foreground mb-3">{currentCall.context}</p>

          {/* Question */}
          <p className="text-sm text-foreground mb-3">{currentCall.question}</p>

          {hasAnswered ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {/* Selected answer as tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Your call:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {getAnswerLabel(hasAnswered)}
                  </span>
                </div>
                {/* Hidden trigger for testing - double tap waiting text */}
                <button
                  onClick={triggerResult}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Waiting for result...
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Answer buttons */}
              <div className="flex items-center gap-2 mb-2">
                {(['yes', 'no', 'inline'] as QuickCallAnswer[]).map((answer) => (
                  <button
                    key={answer}
                    onClick={() => handleAnswer(answer)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {getAnswerLabel(answer)}
                  </button>
                ))}
              </div>

              {/* Result time */}
              <p className="text-[10px] text-muted-foreground">{currentCall.resultTime}</p>
            </>
          )}
        </div>
      </motion.div>

      {/* Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Quick Call Result</DialogTitle>
          </DialogHeader>
          
          {result && (
            <div className="space-y-4 pt-2">
              {/* Headline */}
              <p className="text-base font-medium text-foreground">{result.headline}</p>
              
              {/* User's answer with icon */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">You said:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-secondary">
                  {userAnswer && getAnswerLabel(userAnswer)}
                  {isCorrect ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </span>
              </div>
              
              {/* Result status */}
              <p className={`text-sm font-medium ${isCorrect ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isCorrect ? 'Correct' : 'Missed this one'}
              </p>
              
              {/* Optional insight (only for correct) */}
              {isCorrect && result.insight && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">{result.insight}</p>
                </div>
              )}
              
              {/* Action button */}
              <Button 
                onClick={handleCloseResult} 
                className="w-full"
                variant="default"
              >
                Got it
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}