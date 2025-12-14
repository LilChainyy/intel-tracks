import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useApp } from '@/context/AppContext';

export function QuizWelcome() {
  const { startQuiz, skipQuiz } = useQuiz();
  const { setCurrentScreen } = useApp();

  const handleSkip = () => {
    skipQuiz();
    setCurrentScreen('discovery');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-6xl mb-6"
      >
        🎯
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-2xl font-bold text-foreground text-center mb-3"
      >
        Find Your Perfect
        <br />
        Investment Themes
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-base text-muted-foreground text-center max-w-[280px] mb-12"
      >
        Answer 4 quick questions to discover themes that match how you invest
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full max-w-sm space-y-4"
      >
        <button onClick={startQuiz} className="btn-primary">
          Let's Go (30s)
        </button>

        <button onClick={handleSkip} className="text-link w-full text-center py-2">
          Skip for now →
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex gap-2 mt-12"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-muted" />
        ))}
      </motion.div>
    </div>
  );
}
