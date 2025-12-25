import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useApp } from '@/context/AppContext';

interface PredictionCardProps {
  playlistId: string;
  onPredictionMade?: () => void;
}

const predictionOptions: { value: PredictionType; label: string }[] = [
  { value: 'outperform', label: 'Outperform' },
  { value: 'match', label: 'Match' },
  { value: 'underperform', label: 'Underperform' },
];

// Placeholder crowd data
const crowdData = {
  outperform: 64,
  match: 24,
  underperform: 12,
};

function getPredictionIcon(prediction: PredictionType) {
  switch (prediction) {
    case 'outperform': return TrendingUp;
    case 'match': return Minus;
    case 'underperform': return TrendingDown;
  }
}

export function PredictionCard({ playlistId, onPredictionMade }: PredictionCardProps) {
  const { setCurrentScreen } = useApp();
  const { getPrediction, savePrediction, isLoading } = usePredictions();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType | null>(null);

  const existingPrediction = getPrediction(playlistId);

  const handlePrediction = async (prediction: PredictionType) => {
    if (isLoading) return;

    setSelectedPrediction(prediction);
    const success = await savePrediction(playlistId, prediction);
    
    if (success) {
      setShowConfirmation(true);
      onPredictionMade?.();
    }
  };

  const handleSeeMyCallsClick = () => {
    setCurrentScreen('calls');
  };

  const handleExploreClick = () => {
    setCurrentScreen('discovery');
  };

  const userPick = selectedPrediction || (existingPrediction?.prediction as PredictionType);
  const userPickPercentage = userPick ? crowdData[userPick] : 0;
  const isContrarian = userPickPercentage < 30;
  const isMajority = userPickPercentage >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-surface p-4 mb-6"
    >
      <AnimatePresence mode="wait">
        {showConfirmation && userPick ? (
          <motion.div
            key="confirmation-expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="space-y-4"
          >
            {/* Confirmation Header */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-foreground">Locked in!</span>
            </div>

            {/* User's Call */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">You said:</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getPredictionIcon(userPick);
                  return <Icon className="w-4 h-4 text-primary" />;
                })()}
                <span className="text-sm font-medium text-foreground capitalize">{userPick}</span>
              </div>
            </div>

            {/* Timeline */}
            <p className="text-xs text-muted-foreground">
              We will check back in 30 days
            </p>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Crowd Section */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">The crowd:</p>
              
              <div className="space-y-2">
                {predictionOptions.map((option) => {
                  const percentage = crowdData[option.value];
                  const isUserPick = option.value === userPick;
                  
                  return (
                    <div key={option.value} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${isUserPick ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {option.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs ${isUserPick ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {percentage}%
                            </span>
                            {isUserPick && (
                              <span className="text-[10px] text-primary font-medium">You</span>
                            )}
                          </div>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                            className={`h-full rounded-full ${isUserPick ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consensus/Contrarian Text */}
              <p className="text-xs text-muted-foreground italic">
                {isContrarian ? "Contrarian call" : isMajority ? "You're with the consensus" : "Balanced take"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSeeMyCallsClick}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90"
              >
                See My Calls
              </button>
              <button
                onClick={handleExploreClick}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium bg-secondary text-foreground transition-all hover:bg-secondary/80"
              >
                Explore More
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="prediction-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-sm font-semibold text-foreground mb-1">What is your call?</h2>
            <p className="text-xs text-muted-foreground mb-4">
              This theme vs S&P 500 over next 30 days
            </p>

            {existingPrediction ? (
              <div className="space-y-3">
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
              </div>
            ) : (
              <div className="flex gap-2">
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
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
