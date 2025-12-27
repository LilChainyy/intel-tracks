import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lock } from 'lucide-react';
import { usePredictions, PredictionType } from '@/hooks/usePredictions';
import { useApp } from '@/context/AppContext';
import { ConvictionSlider } from '@/components/predictions/ConvictionSlider';
import { VulnerabilityCheck } from '@/components/predictions/VulnerabilityCheck';
import { getRiskFactors } from '@/data/themeRiskFactors';
import { Button } from '@/components/ui/button';
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

const crowdData = {
  outperform: 64,
  match: 24,
  underperform: 12,
};

type Step = 'direction' | 'conviction' | 'vulnerability';

export function PredictionCard({ playlistId, onPredictionMade }: PredictionCardProps) {
  const { setCurrentScreen } = useApp();
  const { getPrediction, savePrediction, isLoading } = usePredictions();
  
  const [step, setStep] = useState<Step>('direction');
  const [selectedDirection, setSelectedDirection] = useState<PredictionType | null>(null);
  const [conviction, setConviction] = useState(70);
  const [showModal, setShowModal] = useState(false);
  const [finalPrediction, setFinalPrediction] = useState<PredictionType | null>(null);

  const existingPrediction = getPrediction(playlistId);
  const riskFactors = getRiskFactors(playlistId);

  const handleDirectionSelect = (direction: PredictionType) => {
    setSelectedDirection(direction);
    setStep('conviction');
  };

  const handleConvictionConfirm = () => {
    if (conviction >= 85) {
      setStep('vulnerability');
    } else {
      confirmPrediction();
    }
  };

  const handleAdjustConviction = () => {
    setStep('conviction');
  };

  const confirmPrediction = async () => {
    if (!selectedDirection) return;
    
    const success = await savePrediction(playlistId, selectedDirection, conviction);
    
    if (success) {
      setFinalPrediction(selectedDirection);
      setShowModal(true);
      setStep('direction');
      setSelectedDirection(null);
      setConviction(70);
      onPredictionMade?.();
    }
  };

  const handleBack = () => {
    if (step === 'conviction') {
      setStep('direction');
      setSelectedDirection(null);
    } else if (step === 'vulnerability') {
      setStep('conviction');
    }
  };

  const handleSeeMyCallsClick = () => {
    setShowModal(false);
    setCurrentScreen('themes');
  };

  const handleKeepExploringClick = () => {
    setShowModal(false);
    setCurrentScreen('themes');
  };

  const userPick = finalPrediction || (existingPrediction?.prediction as PredictionType);
  const userPickPercentage = userPick ? crowdData[userPick] : 0;
  const isContrarian = userPickPercentage < 30;
  const isMajority = userPickPercentage >= 50;

  // If user already has a prediction, show current state
  if (existingPrediction && step === 'direction') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-surface p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your call is locked in</h2>
        </div>
        <div className="flex gap-2">
          {predictionOptions.map((option) => (
            <div
              key={option.value}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium text-center ${
                existingPrediction.prediction === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          {(existingPrediction as any).conviction || 70}% conviction
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-surface p-4 mb-6"
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Direction */}
          {step === 'direction' && (
            <motion.div
              key="direction"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-sm font-semibold text-foreground mb-1">What's your call?</h2>
              <p className="text-xs text-muted-foreground mb-4">
                This theme vs S&P 500 over next 30 days
              </p>
              <div className="flex gap-2">
                {predictionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDirectionSelect(option.value)}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Conviction */}
          {step === 'conviction' && selectedDirection && (
            <motion.div
              key="conviction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">How confident are you?</h2>
                  <p className="text-xs text-muted-foreground">
                    You said: <span className="text-foreground capitalize">{selectedDirection}</span>
                  </p>
                </div>
                <button
                  onClick={handleBack}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Change
                </button>
              </div>

              <ConvictionSlider value={conviction} onChange={setConviction} />

              <Button
                onClick={handleConvictionConfirm}
                disabled={isLoading}
                className="w-full mt-4"
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock it in
              </Button>
            </motion.div>
          )}

          {/* Step 3: Vulnerability Check (for high conviction) */}
          {step === 'vulnerability' && (
            <motion.div
              key="vulnerability"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VulnerabilityCheck
                riskFactors={riskFactors}
                onAdjust={handleAdjustConviction}
                onConfirm={confirmPrediction}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirmation Drawer */}
      <Drawer open={showModal} onOpenChange={setShowModal}>
        <DrawerContent className="bg-background border-border">
          <div className="mx-auto w-full max-w-md px-6 pb-8">
            <DrawerHeader className="relative px-0 pt-2 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <DrawerTitle className="text-base font-semibold text-foreground">
                  Locked in at {conviction}% conviction
                </DrawerTitle>
              </div>
              <DrawerClose className="absolute right-0 top-2 rounded-full p-1 hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </DrawerClose>
            </DrawerHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You said: <span className="text-foreground font-medium capitalize">{userPick}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Check back in 30 days for your final score
              </p>
              <div className="h-px bg-border" />
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
                        {isUserPick && <span className="text-xs text-primary font-medium ml-2">← You</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground italic pt-1">
                  {isContrarian ? "Contrarian call" : isMajority ? "You're with the consensus" : ""}
                </p>
              </div>
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
