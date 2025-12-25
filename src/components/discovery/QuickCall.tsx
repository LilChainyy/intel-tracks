import { useState } from 'react';
import { motion } from 'framer-motion';

type QuickCallAnswer = 'yes' | 'no' | 'inline';

interface QuickCallData {
  id: string;
  event: string;
  context: string;
  question: string;
  resultTime: string;
}

// Hardcoded example quick calls
const quickCalls: QuickCallData[] = [
  {
    id: 'nvda-earnings',
    event: 'NVDA reports earnings in 2 hours',
    context: 'Consensus: $28B revenue',
    question: 'Will they beat?',
    resultTime: 'Result at 4:30pm ET',
  },
  {
    id: 'fed-decision',
    event: 'Fed rate decision at 2pm ET',
    context: 'Markets pricing 25bp cut',
    question: 'Will they cut?',
    resultTime: 'Result at 2:00pm ET',
  },
  {
    id: 'tsla-deliveries',
    event: 'TSLA Q4 deliveries report tomorrow',
    context: 'Analyst estimate: 485K units',
    question: 'Will they beat estimates?',
    resultTime: 'Result tomorrow 8am ET',
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

  const currentCall = quickCalls[currentIndex];
  const hasAnswered = answers[currentCall.id];

  const handleAnswer = (answer: QuickCallAnswer) => {
    setAnswers(prev => ({ ...prev, [currentCall.id]: answer }));
  };

  return (
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your call:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                {getAnswerLabel(hasAnswered)}
              </span>
            </div>
            
            {/* Waiting text */}
            <p className="text-xs text-muted-foreground">Waiting for result...</p>
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
  );
}