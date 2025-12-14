import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { getMatchLevel, MatchLevel } from '@/utils/matchScore';

interface MatchBadgeProps {
  score: number;
}

export function MatchBadge({ score }: MatchBadgeProps) {
  const level = getMatchLevel(score);

  if (level === 'none') {
    return null;
  }

  const config: Record<Exclude<MatchLevel, 'none'>, { icon: React.ReactNode; className: string }> = {
    great: {
      icon: <Star className="w-3 h-3" />,
      className: 'match-badge-great'
    },
    good: {
      icon: <Check className="w-3 h-3" />,
      className: 'match-badge-good'
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
      className={`flex items-center gap-1 ${config[level].className}`}
    >
      {config[level].icon}
      <span>{score}% Match</span>
    </motion.div>
  );
}
