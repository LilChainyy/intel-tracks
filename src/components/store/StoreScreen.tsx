import { motion } from 'framer-motion';
import { ArrowLeft, Gift } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface RewardCard {
  id: string;
  icon: string;
  name: string;
  value: string;
  cost: number;
}

const rewards: RewardCard[] = [
  { id: 'starbucks', icon: '', name: 'Starbucks', value: '$5', cost: 1000 },
  { id: 'amazon', icon: '', name: 'Amazon', value: '$5', cost: 1000 },
  { id: 'apple', icon: '', name: 'Apple', value: '$10', cost: 2000 },
  { id: 'netflix', icon: '', name: 'Netflix', value: '$15', cost: 3000 },
  { id: 'spotify', icon: '', name: 'Spotify', value: '$10', cost: 2000 },
  { id: 'uber', icon: '', name: 'Uber', value: '$10', cost: 2000 },
];

export function StoreScreen() {
  const { setCurrentScreen } = useApp();
  
  // Mock user credits - in production this would come from user_research_xp table
  const userCredits = 1450;

  const handleRedeem = (reward: RewardCard) => {
    // TODO: Implement redemption logic
    console.log('Redeeming:', reward.name);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-12 md:pt-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentScreen('profile')}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
            >
              Rewards Store
            </motion.h1>
          </div>
          
          {/* Credits Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-4 md:p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-xl md:text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm md:text-base text-muted-foreground">Your Balance</p>
                <p className="text-lg md:text-xl font-bold text-foreground">{userCredits.toLocaleString()} Credits</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Redeem Gift Cards</h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Exchange your earned XP credits for gift cards from your favorite brands.
          </p>
        </motion.div>

        {/* Reward Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          {rewards.map((reward, index) => {
            const canRedeem = userCredits >= reward.cost;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="card-surface p-4 md:p-5 flex flex-col items-center text-center"
              >
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{reward.name}</h3>
                <p className="text-lg md:text-xl font-bold text-primary mb-1">{reward.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">{reward.cost.toLocaleString()} 💰</p>
                
                <button
                  onClick={() => canRedeem && handleRedeem(reward)}
                  disabled={!canRedeem}
                  className={`w-full py-2 md:py-2.5 px-3 rounded-lg text-sm md:text-base font-medium transition-all ${
                    canRedeem
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Redeem' : 'Locked'}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button className="text-sm md:text-base text-primary hover:text-primary/80 transition-colors">
            View All Rewards (12 available) →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
