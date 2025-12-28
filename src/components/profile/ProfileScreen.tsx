import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Unlock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const REWARD_TIERS = [
  { threshold: 50, reward: '$5 credit' },
  { threshold: 100, reward: '$10 credit' },
  { threshold: 200, reward: '$25 credit' },
];

export function ProfileScreen() {
  const { pigPoints } = useApp();
  
  const currentTier = REWARD_TIERS.find(tier => pigPoints < tier.threshold) || REWARD_TIERS[REWARD_TIERS.length - 1];
  const nextThreshold = currentTier?.threshold || 50;
  const progress = Math.min((pigPoints / nextThreshold) * 100, 100);
  const remaining = Math.max(nextThreshold - pigPoints, 0);
  const hasUnlockedFirst = pigPoints >= 50;

  const handleRedeem = () => {
    window.open('https://example.com/redeem', '_blank');
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Main Progress Card */}
      <Card className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl mb-4"
        >
          🐷
        </motion.div>
        
        <div className="text-2xl font-bold mb-2">
          {pigPoints} / {nextThreshold}
        </div>
        
        <Progress value={progress} className="h-3 mb-4" />
        
        {remaining > 0 ? (
          <p className="text-muted-foreground">
            {remaining} more to unlock {currentTier?.reward}
          </p>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-lg font-medium text-primary">
              🎉 You unlocked {currentTier?.reward}!
            </p>
            <Button onClick={handleRedeem} className="gap-2">
              Redeem on Partner Brokerage
              <ExternalLink className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </Card>

      {/* Reward Tiers */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Rewards</h2>
        
        {REWARD_TIERS.map((tier, index) => {
          const isUnlocked = pigPoints >= tier.threshold;
          const isNext = !isUnlocked && (index === 0 || pigPoints >= REWARD_TIERS[index - 1].threshold);
          
          return (
            <Card 
              key={tier.threshold}
              className={`p-4 flex items-center justify-between ${
                isUnlocked ? 'bg-green-500/10 border-green-500/30' : ''
              } ${isNext ? 'border-primary/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                {isUnlocked ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Unlock className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tier.threshold} 🐷</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={isUnlocked ? 'text-green-600 font-medium' : ''}>
                      {tier.reward}
                    </span>
                  </div>
                  {isNext && (
                    <p className="text-xs text-muted-foreground">
                      {tier.threshold - pigPoints} more to go
                    </p>
                  )}
                </div>
              </div>
              
              {isUnlocked && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRedeem}
                  className="text-green-600 border-green-600 hover:bg-green-500/10"
                >
                  Redeem
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
