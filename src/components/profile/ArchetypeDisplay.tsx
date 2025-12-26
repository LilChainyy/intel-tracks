import { motion } from 'framer-motion';
import { Brain, Clock, Target } from 'lucide-react';

interface ArchetypeDisplayProps {
  patternRecognition: number;
  timing: number;
  calibration: number;
  archetypeName: string;
  archetypeDescription: string;
}

export function ArchetypeDisplay({
  patternRecognition,
  timing,
  calibration,
  archetypeName,
  archetypeDescription,
}: ArchetypeDisplayProps) {
  const scores = [
    { 
      label: 'Pattern Recognition', 
      value: patternRecognition, 
      icon: Brain,
      color: 'bg-violet-500'
    },
    { 
      label: 'Timing', 
      value: timing, 
      icon: Clock,
      color: 'bg-amber-500'
    },
    { 
      label: 'Calibration', 
      value: calibration, 
      icon: Target,
      color: 'bg-emerald-500'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-surface p-5"
    >
      {/* Archetype Name */}
      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground mb-1">Your Style</p>
        <h3 className="text-xl font-bold text-foreground">{archetypeName}</h3>
      </div>

      {/* Score Bars */}
      <div className="space-y-4 mb-6">
        {scores.map((score, index) => (
          <motion.div
            key={score.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <score.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{score.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{score.value}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${score.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${score.value}%` }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {archetypeDescription}
        </p>
      </div>
    </motion.div>
  );
}
