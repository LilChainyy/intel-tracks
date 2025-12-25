import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useApp } from '@/context/AppContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

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

export function PredictionCard({ playlistId, onPredictionMade }: PredictionCardProps) {
  const { setCurrentScreen } = useApp();
  const { getPrediction, savePrediction, isLoading } = usePredictions();
  const [showModal, setShowModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType | null>(null);

  const existingPrediction = getPrediction(playlistId);

  const handlePrediction = async (prediction: PredictionType) => {
    if (isLoading) return;

    setSelectedPrediction(prediction);
    const success = await savePrediction(playlistId, prediction);
    
    if (success) {
      setShowModal(true);
      onPredictionMade?.();
    }
  };

  const handleSeeMyCallsClick = () => {
    setShowModal(false);
    setCurrentScreen('calls');
  };

  const handleKeepExploringClick = () => {
    setShowModal(false);
    setCurrentScreen('discovery');
  };

  const userPick = selectedPrediction || (existingPrediction?.prediction as PredictionType);
  const userPickPercentage = userPick ? crowdData[userPick] : 0;
  const isContrarian = userPickPercentage < 30;
  const isMajority = userPickPercentage >= 50;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-surface p-4 mb-6"
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

      <Drawer open={showModal} onOpenChange={setShowModal}>
        <DrawerContent className="bg-background border-border">
          <div className="mx-auto w-full max-w-md px-6 pb-8">
            <DrawerHeader className="relative px-0 pt-2 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <DrawerTitle className="text-base font-semibold text-foreground">
                  Locked in
                </DrawerTitle>
              </div>
              <DrawerClose className="absolute right-0 top-2 rounded-full p-1 hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </DrawerClose>
            </DrawerHeader>

            <div className="space-y-4">
              {/* User's Call */}
              <p className="text-sm text-muted-foreground">
                You said: <span className="text-foreground font-medium capitalize">{userPick}</span>
              </p>

              {/* Timeline */}
              <p className="text-sm text-muted-foreground">
                Check back in 30 days for your final score
              </p>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Crowd Section */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">The crowd:</p>
                
                <div className="space-y-2">
                  {predictionOptions.map((option) => {
                    const percentage = crowdData[option.value];
                    const isUserPick = option.value === userPick;
                    
                    return (
                      <div key={option.value} className="flex items-center justify-between">
                        <span className={`text-sm ${isUserPick ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {option.label}: {percentage}%
                        </span>
                        {isUserPick && (
                          <span className="text-xs text-primary font-medium ml-2">← You</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Consensus/Contrarian Text */}
                <p className="text-sm text-muted-foreground italic pt-1">
                  {isContrarian ? "Contrarian call" : isMajority ? "You're with the consensus" : ""}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSeeMyCallsClick}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90"
                >
                  See My Calls
                </button>
                <button
                  onClick={handleKeepExploringClick}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-secondary text-foreground transition-all hover:bg-secondary/80"
                >
                  Keep Exploring
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
