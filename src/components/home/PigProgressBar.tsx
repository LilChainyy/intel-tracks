import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const REWARD_THRESHOLD = 50;

export function PigProgressBar() {
  const { pigPoints } = useApp();
  const [displayPoints, setDisplayPoints] = useState(pigPoints);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const progress = Math.min((pigPoints / REWARD_THRESHOLD) * 100, 100);
  const remaining = Math.max(REWARD_THRESHOLD - pigPoints, 0);

  useEffect(() => {
    if (pigPoints !== displayPoints) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayPoints(pigPoints);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pigPoints, displayPoints]);

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐷</span>
            <motion.span 
              key={pigPoints}
              initial={isAnimating ? { scale: 1.3, color: 'hsl(var(--primary))' } : false}
              animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="font-semibold"
            >
              {displayPoints}/{REWARD_THRESHOLD}
            </motion.span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-2" />
        
        {remaining > 0 ? (
          <p className="text-xs text-muted-foreground">
            {remaining} more 🐷 to unlock $5 trading credit
          </p>
        ) : (
          <p className="text-xs text-primary font-medium">
            🎉 You unlocked $5 trading credit!
          </p>
        )}
      </div>
    </div>
  );
}
