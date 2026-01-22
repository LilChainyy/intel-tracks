import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';

export function InvestorQuizLanding() {
  const { startQuiz } = useInvestorQuiz();
  const { setCurrentScreen } = useApp();

  const handleBack = () => {
    setCurrentScreen('game-map');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 md:px-8">
      {/* Back Button - Fixed below TopNav */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-16 md:top-20 left-4 md:left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </motion.button>
      <motion.div 
        className="max-w-md md:max-w-lg w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.p 
          className="text-xl md:text-2xl text-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Take this 60-second "Street Smart" quiz to find your investor DNA and match with a legend.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button 
            onClick={startQuiz}
            size="lg"
            className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-medium gap-2 group"
          >
            Start
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
