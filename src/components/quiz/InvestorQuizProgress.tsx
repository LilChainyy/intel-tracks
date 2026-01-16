import { motion } from 'framer-motion';

interface InvestorQuizProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
}

export function InvestorQuizProgress({ currentStep, totalSteps, progress }: InvestorQuizProgressProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {currentStep}/{totalSteps}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
