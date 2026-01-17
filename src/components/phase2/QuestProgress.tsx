import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';

interface QuestProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function QuestProgress({ currentStep, totalSteps }: QuestProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          {currentStep > 0 && currentStep < totalSteps && (
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: -80 }}
              animate={{ x: '400%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {currentStep}/{totalSteps} Steps Complete
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-3 h-3" />
                ) : index === currentStep ? (
                  <span>{index + 1}</span>
                ) : (
                  <Lock className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
