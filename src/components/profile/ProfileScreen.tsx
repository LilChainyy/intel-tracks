import { motion } from 'framer-motion';
import { ChevronRight, Bell, Moon, HelpCircle, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useQuiz } from '@/context/QuizContext';

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

export function ProfileScreen() {
  const { quizCompleted, setCurrentScreen } = useApp();
  const { state, resetQuiz, startQuiz } = useQuiz();

  const handleTakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const summaryItems = quizCompleted
    ? [
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
      ]
    : [];

  const menuItems = [
    { icon: Bell, label: 'Notifications', hasArrow: true },
    { icon: Moon, label: 'Dark Mode', hasCheck: true },
    { icon: HelpCircle, label: 'Help & FAQ', hasArrow: true }
  ];

  return (
    <div className="min-h-screen pb-24 px-6">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Profile
        </motion.h1>
      </div>

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface p-6 text-center mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-semibold text-muted-foreground">G</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Guest User</h2>
      </motion.div>

      {/* Investment DNA or Quiz CTA */}
      {quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-foreground text-center mb-2">Your Investment DNA</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">Based on your answers, here's what we found</p>
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="card-surface p-4">
                <span className="text-sm text-muted-foreground block mb-1">{item.label}</span>
                <span className="text-base font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleRetakeQuiz}
            className="w-full mt-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3">Personalize</h3>
          <div className="card-surface p-6 text-center">
            <h4 className="font-semibold text-foreground mb-1">Take the Quiz</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Find themes that match your investment style
            </p>
            <button onClick={handleTakeQuiz} className="btn-primary">
              Start Quiz
            </button>
          </div>
        </motion.div>
      )}

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="section-header mb-3">Preferences</h3>
        <div className="card-surface overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full px-4 py-3.5 flex items-center justify-between hover:bg-secondary/50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{item.label}</span>
              </div>
              {item.hasArrow && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              {item.hasCheck && (
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
