import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

interface AutopsyEvent {
  date: string;
  description: string;
}

interface AutopsyScreenProps {
  predictionId: string;
  playlistId: string;
  events?: AutopsyEvent[];
  onFactorSelected?: (factor: string) => void;
}

// Sample events - in production these would come from the database
const sampleEvents: Record<string, AutopsyEvent[]> = {
  nuclear: [
    { date: 'Dec 28', description: 'NuScale delays SMR project by 18 months' },
    { date: 'Jan 3', description: 'Natural gas prices dropped 12%' },
    { date: 'Jan 10', description: 'Fed signaled rates staying higher for longer' },
  ],
  netflix: [
    { date: 'Jan 5', description: 'Disney+ announces major price cut' },
    { date: 'Jan 12', description: 'Streaming subscriber growth slows industry-wide' },
    { date: 'Jan 18', description: 'Ad revenue guidance lowered for Q1' },
  ],
  defense: [
    { date: 'Jan 2', description: 'Peace talks announced for Ukraine conflict' },
    { date: 'Jan 8', description: 'Pentagon budget faces congressional delays' },
    { date: 'Jan 15', description: 'European NATO spending commitment questioned' },
  ],
};

export function AutopsyScreen({ 
  predictionId, 
  playlistId, 
  events,
  onFactorSelected 
}: AutopsyScreenProps) {
  const { setCurrentScreen } = useApp();
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const playlist = playlists.find(p => p.id === playlistId);
  const displayEvents = events || sampleEvents[playlistId] || sampleEvents.nuclear;

  const handleFactorSelect = (factor: string) => {
    setSelectedFactor(factor);
    
    // Short delay before showing completion message
    setTimeout(() => {
      setIsComplete(true);
      onFactorSelected?.(factor);
    }, 300);
  };

  const handleBack = () => {
    setCurrentScreen('calls');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">What moved against you</h1>
            <p className="text-xs text-muted-foreground">{playlist?.title || 'Theme Analysis'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Timeline */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Timeline of Events</h2>
          <div className="space-y-3">
            {displayEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {index < displayEvents.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                  <p className="text-sm text-foreground">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Factor Selection */}
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-medium text-foreground">
                Which factor hurt your thesis the most?
              </h2>
              <div className="space-y-2">
                {displayEvents.map((event, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleFactorSelect(event.description)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedFactor === event.description
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm text-foreground">{event.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Success message */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Good analysis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is now tracked in your Pattern Recognition score.
                  </p>
                </div>
              </div>

              {/* Encouragement */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground italic">
                  Missed calls build Edge too — if you understand why.
                </p>
              </div>

              {/* Back button */}
              <Button 
                onClick={handleBack} 
                className="w-full"
              >
                Back to My Calls
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
