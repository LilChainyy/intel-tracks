import { motion } from 'framer-motion';
import { MarketWeather } from '@/components/discovery/MarketWeather';
import { QuickCall } from '@/components/discovery/QuickCall';

export function MarketModeScreen() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Market Mode
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          Real-time market pulse
        </motion.p>
      </div>

      {/* Market Weather */}
      <MarketWeather />

      {/* Quick Call */}
      <QuickCall />
    </div>
  );
}
