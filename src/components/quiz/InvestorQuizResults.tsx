import { motion } from 'framer-motion';
import { Check, AlertTriangle, Share2, RotateCcw, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';

export function InvestorQuizResults() {
  const { state, resetQuiz } = useInvestorQuiz();
  const { setQuizCompleted, setCurrentScreen } = useApp();

  const { archetype } = state;

  if (!archetype) return null;

  const handleContinue = () => {
    setQuizCompleted(true);
    setCurrentScreen('game-map');
  };

  const handleShare = async () => {
    const shareText = `I'm a ${archetype.name}! "${archetype.tagline}" - Find out your investor personality`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Investor Type: ${archetype.name}`,
          text: shareText,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 md:py-12 px-4 md:px-8">
      <motion.div 
        className="max-w-lg md:max-w-3xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Archetype Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 md:space-y-4">
          <p className="text-sm md:text-base font-medium text-primary uppercase tracking-wide">
            Your Investor Type
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {archetype.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground italic">
            "{archetype.tagline}"
          </p>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            {archetype.description}
          </p>
        </motion.div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* You're in good company */}
          <motion.div 
            variants={itemVariants} 
            className="bg-secondary/50 rounded-xl p-5 md:p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h3 className="font-semibold text-foreground md:text-lg">You're in good company</h3>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {archetype.expectedPercentage}% of investors share your style
            </p>
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Famous {archetype.name} investors:
              </p>
              {archetype.famousInvestors.map((investor, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground text-sm md:text-base">{investor.name}</span>
                    <span className="text-muted-foreground text-sm md:text-base"> - {investor.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Strengths & Pitfalls */}
          <motion.div 
            variants={itemVariants} 
            className="bg-background rounded-xl p-5 md:p-6 border border-border"
          >
            <h3 className="font-semibold text-foreground mb-4 md:text-lg">People like you typically:</h3>
            <div className="space-y-3">
              {archetype.strengths.map((strength, index) => (
                <div key={`strength-${index}`} className="flex items-start gap-3">
                  <div className="p-1 bg-green-500/10 rounded shrink-0">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/80">{strength}</span>
                </div>
              ))}
              {archetype.pitfalls.slice(0, 1).map((pitfall, index) => (
                <div key={`pitfall-${index}`} className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500/10 rounded shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/80">{pitfall}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="space-y-3 md:space-y-4">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="w-full md:w-auto md:min-w-[300px] md:mx-auto md:block h-14 text-base md:text-lg font-medium gap-2 group"
          >
            Continue to App
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="flex flex-col md:flex-row gap-3 md:justify-center">
            <Button 
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="flex-1 md:flex-none md:min-w-[140px] gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              onClick={resetQuiz}
              variant="outline"
              size="lg"
              className="flex-1 md:flex-none md:min-w-[140px] gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
