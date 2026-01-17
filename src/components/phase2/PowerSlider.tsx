import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface PowerSliderProps {
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  onComplete: () => void;
}

export function PowerSlider({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onComplete,
}: PowerSliderProps) {
  const [value, setValue] = useState(20);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (value >= 80 && !hasCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  }, [value, hasCompleted, onComplete]);

  const multiplier = 1 + (value / 100) * 9; // 1x to 10x

  return (
    <div className="p-5 rounded-xl bg-card border border-border space-y-4">
      {/* Labels */}
      <div className="flex justify-between text-sm">
        <div className="text-center">
          <p className="font-medium text-foreground">{leftLabel}</p>
          <p className="text-muted-foreground text-xs">{leftValue}</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">{rightLabel}</p>
          <p className="text-muted-foreground text-xs">{rightValue}</p>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative py-4">
        {/* Background track */}
        <div className="h-3 bg-muted rounded-full relative overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-muted-foreground/50 via-primary to-primary"
            style={{ width: `${value}%` }}
          />
          {/* Power pulse effect */}
          {value >= 80 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Slider thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${value}%` }}
          whileTap={{ scale: 1.2 }}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              value >= 80
                ? 'bg-primary ring-4 ring-primary/30'
                : 'bg-card border-2 border-primary'
            }`}
          >
            <Zap
              className={`w-4 h-4 transition-colors ${
                value >= 80 ? 'text-primary-foreground' : 'text-primary'
              }`}
            />
          </div>
        </motion.div>

        {/* Actual range input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Multiplier display */}
      <div className="text-center">
        <motion.div
          key={Math.floor(multiplier)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-2xl font-bold ${
            value >= 80 ? 'text-primary' : 'text-foreground'
          }`}
        >
          {multiplier.toFixed(1)}x Power
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1">
          {value >= 80
            ? '⚡ Maximum power unlocked!'
            : 'Slide right to see the power difference'}
        </p>
      </div>
    </div>
  );
}
