import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';

export function InvestorQuizLanding() {
  const { startQuiz } = useInvestorQuiz();
  const { setCurrentScreen } = useApp();

  const handleSkip = () => {
    setCurrentScreen('phase2-select');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 md:px-8">
      <motion.div 
        className="max-w-md md:max-w-2xl w-full text-center space-y-8 md:space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Card container for desktop */}
        <div className="md:card-surface md:p-12 md:rounded-2xl">
          <div className="space-y-4 md:space-y-6">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Your First $10K
            </motion.h1>
            
            <motion.div 
              className="space-y-4 text-muted-foreground text-lg md:text-xl"
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
            className="space-y-4 mt-8 md:mt-10"
          >
            <Button 
              onClick={startQuiz}
              size="lg"
              className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-medium gap-2 group w-full md:w-auto md:min-w-[200px]"
            >
              Start
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div>
              <button
                onClick={handleSkip}
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Skip to home
              </button>
            </div>
          </motion.div>

          <motion.p 
            className="text-xs md:text-sm text-muted-foreground/60 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            Takes about 2 minutes
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
