import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, RefreshCw, TrendingUp, TrendingDown, Activity, Zap, CloudRain, Sun, Cloud } from 'lucide-react';
import { useMarketWeather, MarketWeatherData } from '@/hooks/useMarketWeather';

const DISMISSED_KEY = 'market-weather-dismissed';
const DISMISSED_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours

interface RegimeConfig {
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

const regimeConfigs: Record<string, RegimeConfig> = {
  'risk-on': {
    icon: <Sun className="w-5 h-5" />,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    textColor: 'text-emerald-500',
  },
  'risk-off': {
    icon: <CloudRain className="w-5 h-5" />,
    gradient: 'from-red-500/20 to-red-600/10',
    textColor: 'text-red-400',
  },
  'momentum': {
    icon: <Zap className="w-5 h-5" />,
    gradient: 'from-amber-500/20 to-amber-600/10',
    textColor: 'text-amber-500',
  },
  'sideways': {
    icon: <Cloud className="w-5 h-5" />,
    gradient: 'from-muted/50 to-muted/30',
    textColor: 'text-muted-foreground',
  },
  'volatile': {
    icon: <Activity className="w-5 h-5" />,
    gradient: 'from-orange-500/20 to-orange-600/10',
    textColor: 'text-orange-400',
  },
  'neutral': {
    icon: <Activity className="w-5 h-5" />,
    gradient: 'from-muted/50 to-muted/30',
    textColor: 'text-muted-foreground',
  },
};

function getRegimeConfig(type: string): RegimeConfig {
  return regimeConfigs[type] || regimeConfigs.neutral;
}

function VixIndicator({ value, change }: { value: number; change: number }) {
  const isElevated = value > 20;
  const color = isElevated ? 'text-red-400' : 'text-emerald-500';
  
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">VIX</span>
      <span className={`font-medium ${color}`}>{value.toFixed(0)}</span>
      <span className={change > 0 ? 'text-red-400' : 'text-emerald-500'}>
        {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      </span>
    </div>
  );
}

function SP500Indicator({ aboveMa }: { aboveMa: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">S&P</span>
      <span className={aboveMa ? 'text-emerald-500' : 'text-red-400'}>
        {aboveMa ? 'Above' : 'Below'} 200MA
      </span>
    </div>
  );
}

export function MarketWeather() {
  const { data, isLoading, error, refresh } = useMarketWeather();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if previously dismissed (with expiry)
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISSED_EXPIRY) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(DISMISSED_KEY);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (isDismissed) return null;

  if (isLoading && !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mb-4"
      >
        <div className="card-surface p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return null; // Silently fail - don't disrupt the main experience
  }

  const config = getRegimeConfig(data.regime_type);
  const indicators = data.indicators;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-6 mb-4"
      >
        <div className={`card-surface p-4 bg-gradient-to-r ${config.gradient} border-border/50`}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2 rounded-full bg-background/50 ${config.textColor}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-sm font-semibold ${config.textColor}`}>
                  {data.headline}
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1 rounded hover:bg-background/50 transition-colors"
                  aria-label="Refresh market weather"
                >
                  <RefreshCw className={`w-3 h-3 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <p className="text-xs text-foreground/80 leading-relaxed mb-2">
                {data.summary}
              </p>

              {/* Indicators */}
              <div className="flex items-center gap-4">
                <VixIndicator value={indicators.vix.value} change={indicators.vix.change} />
                <SP500Indicator aboveMa={indicators.sp500.aboveMa} />
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:bg-background/50 transition-colors"
              aria-label="Dismiss market weather"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
