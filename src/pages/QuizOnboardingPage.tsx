import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useNavigate } from 'react-router-dom';

export default function QuizOnboardingPage() {
  const { startQuiz, skipQuiz } = useInvestorQuiz();
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    startQuiz();
    navigate('/quiz');
  };

  const handleSkip = () => {
    skipQuiz();
    // Navigate to browse themes even when skipping
    navigate('/stocks?screen=theme-list&tab=theme');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 px-4 md:px-8">
      <motion.div
        className="max-w-2xl w-full text-center space-y-8 md:space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Discover Your Investor DNA
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Take a quick 2-minute quiz to unlock personalized playlist recommendations that match your style.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <Target className="w-6 h-6 text-primary" />
            <p className="text-sm font-medium text-foreground">Personalized Matches</p>
            <p className="text-xs text-muted-foreground">See your match % with each playlist</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <TrendingUp className="w-6 h-6 text-primary" />
            <p className="text-sm font-medium text-foreground">Know Your Style</p>
            <p className="text-xs text-muted-foreground">Get your unique investor persona</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50">
            <Sparkles className="w-6 h-6 text-primary" />
            <p className="text-sm font-medium text-foreground">Smart Recommendations</p>
            <p className="text-xs text-muted-foreground">Find themes that fit your goals</p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 text-base md:text-lg font-medium gap-2 group"
          >
            Take the Quiz
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 text-base md:text-lg font-medium text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="text-xs md:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          You can always retake the quiz later from your profile
        </motion.p>
      </motion.div>
    </div>
  );
}
