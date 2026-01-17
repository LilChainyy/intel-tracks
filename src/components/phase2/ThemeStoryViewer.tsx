import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { themeStories, selectorThemes } from '@/data/themeStoryData';
import { playlists } from '@/data/playlists';
import { getStockRole } from '@/data/stockRoles';
import { useStockData } from '@/hooks/useStockData';
import { QuestProgress } from './QuestProgress';
import { PowerSlider } from './PowerSlider';
import { StockAssetCard } from './StockAssetCard';
import { MicroResearchDrawer } from './MicroResearchDrawer';
import { LevelUpNotification } from './LevelUpNotification';
import { PostStoryChoice } from './PostStoryChoice';
import {
  ArrowLeft,
  MessageCircle,
  Lock,
  Unlock,
  Zap,
  Target,
} from 'lucide-react';
import { Stock } from '@/types/playlist';
import { Button } from '@/components/ui/button';

export function ThemeStoryViewer() {
  const {
    currentThemeStoryId,
    setCurrentScreen,
    addViewedTheme,
    phase2ViewedThemes,
    setSelectedStock,
  } = useApp();

  // Quest state
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [stocksUnlocked, setStocksUnlocked] = useState(false);
  const [showMastery, setShowMastery] = useState(false);

  // Drawer state
  const [selectedStockForDrawer, setSelectedStockForDrawer] = useState<Stock | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const story = currentThemeStoryId ? themeStories[currentThemeStoryId] : null;
  const playlist = story ? playlists.find((p) => p.id === story.themeId) : null;

  // Get tickers for YTD data
  const tickers = playlist?.stocks.filter((s) => !s.isPrivate).map((s) => s.ticker) || [];
  const { isLoading, formatYtdChange } = useStockData(tickers);

  useEffect(() => {
    if (currentThemeStoryId && !phase2ViewedThemes.includes(currentThemeStoryId)) {
      addViewedTheme(currentThemeStoryId);
    }
  }, [currentThemeStoryId, addViewedTheme, phase2ViewedThemes]);

  // Handle step 1 completion
  const handleStep1Click = useCallback(() => {
    if (!step1Complete) {
      setStep1Complete(true);
      setCurrentStep(1);
    }
  }, [step1Complete]);

  // Handle step 2 completion (slider)
  const handleStep2Complete = useCallback(() => {
    if (!step2Complete) {
      setStep2Complete(true);
      setCurrentStep(2);
      // Unlock stocks after a short delay for dramatic effect
      setTimeout(() => {
        setStocksUnlocked(true);
        setCurrentStep(3);
        // Show mastery notification
        setTimeout(() => {
          setShowMastery(true);
          // Hide after 4 seconds
          setTimeout(() => setShowMastery(false), 4000);
        }, 500);
      }, 600);
    }
  }, [step2Complete]);

  const handleBack = () => {
    setCurrentScreen('phase2-select');
  };

  const handleSeeAnother = () => {
    setCurrentScreen('phase2-select');
  };

  const handleStockCardClick = (stock: Stock) => {
    setSelectedStockForDrawer(stock);
    setDrawerOpen(true);
  };

  const handleViewFullAnalysis = () => {
    if (selectedStockForDrawer && playlist) {
      setSelectedStock({ ticker: selectedStockForDrawer.ticker, playlist });
      setCurrentScreen('stock');
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Theme not found</p>
      </div>
    );
  }

  // Get power comparison data based on theme
  const getPowerComparisonData = () => {
    switch (story.id) {
      case 'nuclear':
        return {
          leftLabel: 'Google Search',
          rightLabel: 'ChatGPT Query',
          leftValue: '1x Power',
          rightValue: '10x Power',
        };
      case 'netflix':
        return {
          leftLabel: 'Cable TV Viewers',
          rightLabel: 'Streaming Subscribers',
          leftValue: 'Declining',
          rightValue: 'Growing 10x',
        };
      case 'defense':
        return {
          leftLabel: 'Peace Dividend Era',
          rightLabel: 'New Cold War',
          leftValue: 'Budget Cuts',
          rightValue: 'Unlimited Spend',
        };
      case 'space':
        return {
          leftLabel: 'Shuttle Era',
          rightLabel: 'SpaceX Era',
          leftValue: '$50k/kg',
          rightValue: '$3k/kg',
        };
      default:
        return {
          leftLabel: 'Old Way',
          rightLabel: 'New Way',
          leftValue: '1x',
          rightValue: '10x',
        };
    }
  };

  const powerData = getPowerComparisonData();

  return (
    <div className="min-h-screen bg-background">
      {/* Quest Progress Header */}
      <div className="sticky top-0 z-30">
        <QuestProgress currentStep={currentStep} totalSteps={3} />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-16 left-4 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:inline">Back</span>
      </motion.button>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-32">
        {/* Theme Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-5xl mb-4 block">{story.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {story.title}
          </h1>
        </motion.div>

        {/* STEP 1: The Signal (Dialogue Layer) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* AI Game Master Bubble */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">AI Game Master</p>
              <div className="p-4 rounded-2xl rounded-tl-md bg-card border border-border">
                <p className="font-semibold text-foreground text-lg mb-3">
                  {story.act1.hookLine}
                </p>
                <div className="p-3 rounded-lg bg-muted/50 mb-3">
                  <p className="text-sm text-muted-foreground mb-1">
                    {story.act1.recentCatalyst.date}
                  </p>
                  <p className="text-foreground font-medium">
                    {story.act1.recentCatalyst.event}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    {story.act1.recentCatalyst.impact}
                  </p>
                </div>
                <p className="text-foreground/80">{story.act1.whyItMatters}</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleStep1Click}
              disabled={step1Complete}
              size="lg"
              className={`w-full text-base py-6 transition-all duration-300 ${
                step1Complete
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
              }`}
            >
              {step1Complete ? (
                <>
                  <Unlock className="w-5 h-5 mr-2" />
                  Unlocked: The Logic
                </>
              ) : (
                'Why did they do it?'
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* STEP 2: The Logic (Interactive Module) - Shimmer Reveal */}
        <AnimatePresence>
          {step1Complete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-8 overflow-hidden"
            >
              {/* Shimmer line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-6 origin-left"
              />

              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  The Logic
                </h3>
              </div>

              {/* Power Slider */}
              <PowerSlider
                leftLabel={powerData.leftLabel}
                rightLabel={powerData.rightLabel}
                leftValue={powerData.leftValue}
                rightValue={powerData.rightValue}
                onComplete={handleStep2Complete}
              />

              {/* Inflection explanation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 rounded-xl bg-muted/50 border border-border"
              >
                <p className="text-foreground/80 leading-relaxed">
                  {story.act2.inflectionPoint}
                </p>
                <p className="text-foreground font-medium italic mt-3">
                  "{story.act2.stakes}"
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 3: The Loadout (Stock Stack) */}
        <AnimatePresence>
          {step2Complete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {/* Unlock transition line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-6 origin-left"
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">
                    The Loadout
                  </h3>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    stocksUnlocked
                      ? 'bg-emerald/20 text-emerald'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stocksUnlocked ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Unlocking...
                    </>
                  )}
                </motion.div>
              </div>

              {/* Stock Cards */}
              {playlist && (
                <div className="space-y-3">
                  {playlist.stocks.map((stock, index) => {
                    const roleData = getStockRole(story.themeId, stock.ticker);
                    return (
                      <StockAssetCard
                        key={stock.ticker}
                        stock={stock}
                        roleData={roleData}
                        ytdChange={stock.isPrivate ? undefined : formatYtdChange(stock.ticker)}
                        isLoading={isLoading}
                        isLocked={!stocksUnlocked}
                        index={index}
                        onClick={() => handleStockCardClick(stock)}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post Story Choice - only show after full completion */}
        {stocksUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PostStoryChoice
              onSeeAnother={handleSeeAnother}
              viewedCount={phase2ViewedThemes.length}
              totalCount={selectorThemes.length}
            />
          </motion.div>
        )}
      </div>

      {/* Micro Research Drawer */}
      <MicroResearchDrawer
        stock={selectedStockForDrawer}
        roleData={
          selectedStockForDrawer && story
            ? getStockRole(story.themeId, selectedStockForDrawer.ticker)
            : undefined
        }
        ytdChange={
          selectedStockForDrawer && !selectedStockForDrawer.isPrivate
            ? formatYtdChange(selectedStockForDrawer.ticker)
            : undefined
        }
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onViewFull={handleViewFullAnalysis}
      />

      {/* Level Up Notification */}
      <LevelUpNotification show={showMastery} themeName={story.title} />
    </div>
  );
}
