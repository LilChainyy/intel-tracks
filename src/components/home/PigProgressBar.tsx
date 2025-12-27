import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';

const REWARD_THRESHOLD = 50;

export function PigProgressBar() {
  const { pigPoints } = useApp();
  
  const progress = Math.min((pigPoints / REWARD_THRESHOLD) * 100, 100);
  const remaining = Math.max(REWARD_THRESHOLD - pigPoints, 0);

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐷</span>
            <span className="font-semibold">{pigPoints}/{REWARD_THRESHOLD}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-2" />
        
        {remaining > 0 ? (
          <p className="text-xs text-muted-foreground">
            再攒 {remaining} 个 🐷 解锁 $5 交易金
          </p>
        ) : (
          <p className="text-xs text-primary font-medium">
            🎉 已解锁 $5 交易金!
          </p>
        )}
      </div>
    </div>
  );
}
