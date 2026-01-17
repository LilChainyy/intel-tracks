import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { Sparkles } from 'lucide-react';

export function Phase2Intro() {
  const { state } = useInvestorQuiz();
  const { setCurrentScreen } = useApp();
  
  const archetypeName = state.archetype?.name || 'Investor';

  const handleContinue = () => {
    setCurrentScreen('phase2-select');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        {/* Archetype Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{archetypeName}</span>
        </motion.div>

        {/* Main Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            You're a {archetypeName}.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Let me show you what's moving in 2025.
          </p>
          
          <div className="space-y-2 text-lg text-muted-foreground/80">
            <p>Not predictions.</p>
            <p className="font-medium text-foreground">Stories already unfolding.</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
          >
            Show Me
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
