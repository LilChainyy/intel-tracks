import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useApp } from '@/context/AppContext';

const answerLabels: Record<string, Record<string, string>> = {
  risk: {
    safe: 'Steady wins',
    balanced: 'Balanced',
    growth: 'Growth',
    yolo: 'Moon shots'
  },
  timeline: {
    short: '< 1 year',
    medium: '1-3 years',
    long: '3-5 years',
    forever: '5+ years'
  },
  sectors: {
    tech: 'Tech',
    energy: 'Energy',
    healthcare: 'Healthcare',
    finance: 'Finance',
    consumer: 'Consumer',
    industrial: 'Industrial',
    space: 'Space',
    entertainment: 'Entertainment'
  }
};

export function QuizResults() {
  const { state, completeQuiz } = useQuiz();
  const { setCurrentScreen, setQuizCompleted } = useApp();

  const handleSeeMatches = () => {
    completeQuiz();
    setQuizCompleted(true);
    setCurrentScreen('discovery');
  };

  const summaryItems = [
    {
      label: 'Risk',
      value: answerLabels.risk[state.answers.risk as string] || 'Not set'
    },
    {
      label: 'Sectors',
      value: Array.isArray(state.answers.sectors)
        ? state.answers.sectors.map((s) => answerLabels.sectors[s]).join(', ')
        : 'Not set'
    },
    {
      label: 'Timeline',
      value: answerLabels.timeline[state.answers.timeline as string] || 'Not set'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-foreground text-center mb-2"
      >
        Your Investment DNA
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base text-muted-foreground text-center mb-8"
      >
        Based on your answers, here's what we found
      </motion.p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm space-y-3"
      >
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            custom={index}
            className="card-surface p-4 flex items-center gap-3"
          >
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <p className="text-foreground font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm mt-8"
      >
        <button onClick={handleSeeMatches} className="btn-primary">
          See Your Matches
        </button>
      </motion.div>
    </div>
  );
}
