import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useAuth } from '@/context/AuthContext';

interface PredictionCardProps {
  playlistId: string;
  onPredictionMade?: () => void;
}

const predictionOptions: { value: PredictionType; label: string }[] = [
  { value: 'outperform', label: 'Outperform' },
  { value: 'match', label: 'Match' },
  { value: 'underperform', label: 'Underperform' },
];

export function PredictionCard({ playlistId, onPredictionMade }: PredictionCardProps) {
  const { user } = useAuth();
  const { getPrediction, savePrediction, isLoading } = usePredictions();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType | null>(null);

  const existingPrediction = getPrediction(playlistId);

  const handlePrediction = async (prediction: PredictionType) => {
    if (!user || isLoading) return;

    setSelectedPrediction(prediction);
    const success = await savePrediction(playlistId, prediction);
    
    if (success) {
      setShowConfirmation(true);
      onPredictionMade?.();
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-surface p-4 mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-1">🎯 What's your call?</h2>
        <p className="text-xs text-muted-foreground mb-4">Sign in to make predictions</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-surface p-4 mb-6"
    >
      <h2 className="text-sm font-semibold text-foreground mb-1">🎯 What's your call?</h2>
      <p className="text-xs text-muted-foreground mb-4">
        This theme vs S&P 500 over next 30 days
      </p>

      <AnimatePresence mode="wait">
        {showConfirmation ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald/10 border border-emerald/20"
          >
            <Check className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">
              Got it. We'll track this for you.
            </span>
          </motion.div>
        ) : existingPrediction ? (
          <motion.div
            key="existing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              {predictionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePrediction(option.value)}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    existingPrediction.prediction === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your call: <span className="text-foreground font-medium capitalize">{existingPrediction.prediction}</span>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            {predictionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePrediction(option.value)}
                disabled={isLoading}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground ${
                  isLoading && selectedPrediction === option.value ? 'opacity-50' : ''
                } ${isLoading ? 'cursor-not-allowed' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
