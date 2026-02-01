import { Sparkles } from 'lucide-react';

interface MatchPercentageBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export function MatchPercentageBadge({ score, size = 'md' }: MatchPercentageBadgeProps) {
  const colors = getMatchColor(score);
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`
      inline-flex items-center gap-1.5
      ${sizeClasses}
      rounded-full
      border-2
      font-semibold
      ${colors.bg} ${colors.text} ${colors.border}
    `}>
      <Sparkles className={`${iconSize} ${colors.icon}`} />
      <span>{score}% match</span>
    </span>
  );
}

function getMatchColor(score: number) {
  if (score >= 80) {
    return {
      bg: 'bg-green-500/20',
      text: 'text-green-700',
      border: 'border-green-500/50',
      icon: 'text-green-600'
    };
  } else if (score >= 60) {
    return {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-700',
      border: 'border-yellow-500/50',
      icon: 'text-yellow-600'
    };
  } else {
    return {
      bg: 'bg-gray-500/20',
      text: 'text-gray-700',
      border: 'border-gray-500/50',
      icon: 'text-gray-600'
    };
  }
}
