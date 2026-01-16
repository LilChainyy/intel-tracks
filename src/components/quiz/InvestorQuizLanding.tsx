import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';

export function InvestorQuizLanding() {
  const { startQuiz } = useInvestorQuiz();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <motion.div 
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="space-y-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Your First $10K
          </motion.h1>
          
          <motion.div 
            className="space-y-4 text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="font-medium text-foreground/90">
              Imagine: You just got $10,000.
            </p>
            <p>
              Maybe it's a bonus, savings, or a graduation gift.
            </p>
            <p>
              The money's sitting in your account right now.
            </p>
            <p className="text-foreground font-medium pt-2">
              What happens next?
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button 
            onClick={startQuiz}
            size="lg"
            className="h-14 px-8 text-lg font-medium gap-2 group"
          >
            Start
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.p 
          className="text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Takes about 2 minutes
        </motion.p>
      </motion.div>
    </div>
  );
}
