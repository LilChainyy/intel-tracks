import { motion } from 'framer-motion';
import { Award, Star, Sparkles } from 'lucide-react';
import { MatchLevel } from '@/utils/matchScore';

interface MatchBadgeProps {
  score: number;
  level: MatchLevel;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'circular';
  animate?: boolean;
}

export function MatchBadge({
  score,
  level,
  size = 'md',
  variant = 'default',
  animate = false
}: MatchBadgeProps) {
  // Icon based on match level
  const Icon = level === 'excellent' ? Award : level === 'great' ? Star : Sparkles;

  // Size-based styling
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Color based on match level
  const colorClasses = {
    excellent: 'bg-green-500/20 text-green-700 border-green-400/50',
    great: 'bg-blue-500/20 text-blue-700 border-blue-400/50',
    good: 'bg-purple-500/20 text-purple-700 border-purple-400/50',
    none: 'bg-gray-500/20 text-gray-700 border-gray-400/50'
  };

  if (variant === 'circular') {
    // Circular variant for hero card
    const circularSizes = {
      sm: 'w-12 h-12 text-sm',
      md: 'w-16 h-16 text-xl',
      lg: 'w-20 h-20 text-2xl'
    };

    return (
      <motion.div
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ type: 'spring', duration: 0.5 }}
        className={`${circularSizes[size]} rounded-full border-2 ${colorClasses[level]} flex flex-col items-center justify-center font-bold`}
      >
        {animate ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {score}%
          </motion.span>
        ) : (
          <span>{score}%</span>
        )}
        <span className="text-xs font-medium mt-0.5 opacity-80">match</span>
      </motion.div>
    );
  }

  // Default pill variant
  return (
    <motion.span
      initial={animate ? { opacity: 0, x: -10 } : undefined}
      animate={animate ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full border-2 ${colorClasses[level]} font-semibold`}
    >
      <Icon className={iconSizes[size]} />
      <span>{score}% match</span>
    </motion.span>
  );
}
