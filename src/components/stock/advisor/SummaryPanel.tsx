import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, CheckCircle2, BarChart3, AlertTriangle, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  LearningProgress, 
  calculateSubsectionProgress, 
  calculateSectionProgress, 
  calculateOverallProgress 
} from './types';
import { useLanguage } from '@/context/LanguageContext';

interface SummaryPanelProps {
  progress: LearningProgress;
  onAskAbout: (topic: string) => void;
  onBuildThesis: () => void;
  companyName: string;
  onClose?: () => void;
}

export function SummaryPanel({ progress, onAskAbout, onBuildThesis, companyName, onClose }: SummaryPanelProps) {
  const { language } = useLanguage();
  const overallProgress = calculateOverallProgress(progress);
  const showThesisButton = overallProgress >= 60;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    understanding: false,
    risks: false,
    valuation: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-green-500';
    if (progress >= 40) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-muted-foreground';
  };

  const labels = {
    en: {
      overallProgress: 'Overall Progress',
      understanding: 'Understanding',
      companyFundamental: 'Company Fundamental',
      financialHealth: 'Financial Health',
      industryContext: 'Industry Context',
      risks: 'Risks',
      companyRisks: 'Company Risks',
      externalRisks: 'External Risks',
      investmentRisks: 'Investment Risks',
      valuation: 'Valuation',
      currentPrice: 'Current Price',
      companyValuation: 'Company Valuation',
      expectedReturns: 'Expected Returns',
      askAbout: 'Ask about this →',
      buildThesis: '✨ Build Your Thesis',
      ready: "🎉 You've learned enough! Ready to build your thesis.",
    },
    zh: {
      overallProgress: '整体进度',
      understanding: '理解',
      companyFundamental: '公司基本面',
      financialHealth: '财务健康',
      industryContext: '行业背景',
      risks: '风险',
      companyRisks: '公司风险',
      externalRisks: '外部风险',
      investmentRisks: '投资风险',
      valuation: '估值',
      currentPrice: '当前价格',
      companyValuation: '公司估值',
      expectedReturns: '预期回报',
      askAbout: '了解更多 →',
      buildThesis: '✨ 建立投资论点',
      ready: "🎉 你已经学到足够多了！准备建立你的论点。",
    },
  };

  const t = labels[language];

  const renderSubsection = (
    label: string,
    subsection: { questionsAsked: number; summaryPoints: string[] },
    topic: string
  ) => {
    const progress = calculateSubsectionProgress(subsection);
    const hasContent = subsection.summaryPoints.length > 0;

    return (
      <div key={topic} className="py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasContent ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
            )}
            <span className="text-sm text-foreground">{label}</span>
          </div>
          <span className={`text-xs font-medium ${getProgressColor(progress)}`}>
            {Math.round(progress)}%
          </span>
        </div>
        {hasContent ? (
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            {subsection.summaryPoints[subsection.summaryPoints.length - 1]}
          </p>
        ) : (
          <button
            onClick={() => onAskAbout(topic)}
            className="text-xs text-primary hover:underline mt-1 ml-6"
          >
            {t.askAbout}
          </button>
        )}
      </div>
    );
  };

  const understandingProgress = calculateSectionProgress(progress.understanding);
  const risksProgress = calculateSectionProgress(progress.risks);
  const valuationProgress = calculateSectionProgress(progress.valuation);

  const renderSectionHeader = (
    icon: React.ReactNode,
    label: string,
    sectionProgress: number,
    sectionKey: string
  ) => (
    <CollapsibleTrigger 
      className="w-full"
      onClick={() => toggleSection(sectionKey)}
    >
      <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
        {icon}
        <span className="text-sm font-semibold text-foreground flex-1 text-left">{label}</span>
        <span className={`text-xs mr-2 ${getProgressColor(sectionProgress)}`}>
          {Math.round(sectionProgress)}%
        </span>
        <motion.div
          animate={{ rotate: expandedSections[sectionKey] ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>
      <div className="px-3 pb-2">
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${getProgressBg(sectionProgress)}`} 
            style={{ width: `${sectionProgress}%` }} 
          />
        </div>
      </div>
    </CollapsibleTrigger>
  );

  return (
    <div className="h-full flex flex-col bg-background border-l border-border overflow-hidden">
      {/* Header with overall progress */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{t.overallProgress}</span>
          <span className={`text-sm font-bold ${getProgressColor(overallProgress)}`}>
            {Math.round(overallProgress)}%
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        
        {showThesisButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-xs text-green-600 dark:text-green-400 mb-2">{t.ready}</p>
            <Button
              onClick={onBuildThesis}
              className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {t.buildThesis}
            </Button>
          </motion.div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {/* Understanding Section */}
          <Collapsible open={expandedSections.understanding}>
            {renderSectionHeader(
              <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0" />,
              t.understanding,
              understandingProgress,
              'understanding'
            )}
            <CollapsibleContent>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 ml-2 border-l-2 border-blue-500/20 pl-2"
                >
                  {renderSubsection(t.companyFundamental, progress.understanding.company_fundamental, 'company_fundamental')}
                  {renderSubsection(t.financialHealth, progress.understanding.financial_health, 'financial_health')}
                  {renderSubsection(t.industryContext, progress.understanding.industry_context, 'industry_context')}
                </motion.div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>

          {/* Risks Section */}
          <Collapsible open={expandedSections.risks}>
            {renderSectionHeader(
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
              t.risks,
              risksProgress,
              'risks'
            )}
            <CollapsibleContent>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 ml-2 border-l-2 border-amber-500/20 pl-2"
                >
                  {renderSubsection(t.companyRisks, progress.risks.company_risks, 'company_risks')}
                  {renderSubsection(t.externalRisks, progress.risks.external_risks, 'external_risks')}
                  {renderSubsection(t.investmentRisks, progress.risks.investment_risks, 'investment_risks')}
                </motion.div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>

          {/* Valuation Section */}
          <Collapsible open={expandedSections.valuation}>
            {renderSectionHeader(
              <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />,
              t.valuation,
              valuationProgress,
              'valuation'
            )}
            <CollapsibleContent>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 ml-2 border-l-2 border-green-500/20 pl-2"
                >
                  {renderSubsection(t.currentPrice, progress.valuation.current_price, 'current_price')}
                  {renderSubsection(t.companyValuation, progress.valuation.company_valuation, 'company_valuation')}
                  {renderSubsection(t.expectedReturns, progress.valuation.expected_returns, 'expected_returns')}
                </motion.div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
