import { motion } from 'framer-motion';
import { Target, TrendingUp, Award } from 'lucide-react';

interface EdgeStatsProps {
  totalEdge: number;
  callsMade: number;
  accuracy: number;
}

export function EdgeStats({ totalEdge, callsMade, accuracy }: EdgeStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5"
    >
      {/* Main Edge Score */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Award className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Your Edge</p>
          <p className="text-3xl font-bold text-foreground">{totalEdge}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Calls made</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{callsMade}</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{accuracy}%</p>
        </div>
      </div>
    </motion.div>
  );
}
