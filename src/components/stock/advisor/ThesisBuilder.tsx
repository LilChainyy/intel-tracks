import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Minus, TrendingDown, PenLine, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LearningProgress, ThesisChoice } from './types';

interface ThesisBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  ticker: string;
  progress: LearningProgress;
  onSaveThesis: (thesis: ThesisChoice) => void;
}

export function ThesisBuilder({
  open,
  onOpenChange,
  companyName,
  ticker,
  progress,
  onSaveThesis,
}: ThesisBuilderProps) {
  const [selectedStance, setSelectedStance] = useState<'bullish' | 'neutral' | 'bearish' | 'custom' | null>(null);
  const [customText, setCustomText] = useState('');

  const labels = {
    title: 'Build Your Investment Thesis',
    subtitle: `Based on your research of ${companyName}`,
    summaryTitle: 'Your Summary',
    understanding: '📊 What you understand about the business',
    risks: '⚠️ Risks you identified',
    valuation: '💰 Your view on the price',
    stanceTitle: 'Your Thesis Stance',
    bullish: 'Bullish - I want to invest',
    bullishDesc: `I believe ${companyName} is a strong company at a fair price with manageable risks`,
    neutral: 'Neutral - Watchlist only',
    neutralDesc: 'Interesting company but too expensive or risky for me right now',
    bearish: 'Bearish - Not for me',
    bearishDesc: 'The risks outweigh the potential, I\'ll look elsewhere',
    custom: 'Custom - Write my own thesis',
    customPlaceholder: 'Write your investment thesis here...',
    keepExploring: 'Keep Exploring',
    saveThesis: 'Save Thesis',
    noPoints: 'Keep exploring to learn more',
  };

  const getSummaryPoints = (section: { [key: string]: { summaryPoints: string[] } }): string[] => {
    return Object.values(section).flatMap(s => s.summaryPoints);
  };

  const understandingPoints = getSummaryPoints(progress.understanding);
  const riskPoints = getSummaryPoints(progress.risks);
  const valuationPoints = getSummaryPoints(progress.valuation);

  const handleSave = () => {
    if (!selectedStance) return;
    
    onSaveThesis({
      stance: selectedStance,
      customText: selectedStance === 'custom' ? customText : undefined,
      savedAt: new Date(),
    });
    onOpenChange(false);
  };

  const stanceOptions = [
    {
      id: 'bullish' as const,
      icon: TrendingUp,
      label: labels.bullish,
      description: labels.bullishDesc,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
      selectedBg: 'bg-green-500/20 border-green-500',
    },
    {
      id: 'neutral' as const,
      icon: Minus,
      label: labels.neutral,
      description: labels.neutralDesc,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
      selectedBg: 'bg-yellow-500/20 border-yellow-500',
    },
    {
      id: 'bearish' as const,
      icon: TrendingDown,
      label: labels.bearish,
      description: labels.bearishDesc,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
      selectedBg: 'bg-red-500/20 border-red-500',
    },
    {
      id: 'custom' as const,
      icon: PenLine,
      label: labels.custom,
      description: '',
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/30 hover:bg-primary/20',
      selectedBg: 'bg-primary/20 border-primary',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {labels.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{labels.summaryTitle}</h3>
            
            <div className="grid gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {labels.understanding}
                </h4>
                {understandingPoints.length > 0 ? (
                  <ul className="text-sm text-foreground space-y-1">
                    {understandingPoints.slice(-3).map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{labels.noPoints}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                  {labels.risks}
                </h4>
                {riskPoints.length > 0 ? (
                  <ul className="text-sm text-foreground space-y-1">
                    {riskPoints.slice(-3).map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{labels.noPoints}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  {labels.valuation}
                </h4>
                {valuationPoints.length > 0 ? (
                  <ul className="text-sm text-foreground space-y-1">
                    {valuationPoints.slice(-3).map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{labels.noPoints}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stance Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{labels.stanceTitle}</h3>
            
            <div className="grid gap-3">
              {stanceOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedStance(option.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedStance === option.id ? option.selectedBg : option.bgColor
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedStance === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={labels.customPlaceholder}
                  className="min-h-[100px]"
                />
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {labels.keepExploring}
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-purple-500"
              onClick={handleSave}
              disabled={!selectedStance || (selectedStance === 'custom' && !customText.trim())}
            >
              {labels.saveThesis}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
