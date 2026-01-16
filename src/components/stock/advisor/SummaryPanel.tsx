import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, BarChart3, AlertTriangle, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            <span className="text-sm text-foreground">{label}</span>
          </div>
          <span className={`text-xs font-medium ${getProgressColor(progress)}`}>
            {Math.round(progress)}%
          </span>
        </div>
        {hasContent ? (
          <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-2">
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

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header with overall progress */}
      <div className="p-4 border-b border-border">
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Understanding Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">{t.understanding}</span>
              <span className={`text-xs ml-auto ${getProgressColor(understandingProgress)}`}>
                {Math.round(understandingProgress)}%
              </span>
            </div>
            <div className={`h-1 rounded-full ${getProgressBg(understandingProgress)}`} style={{ width: `${understandingProgress}%` }} />
            <div className="space-y-1 mt-2">
              {renderSubsection(t.companyFundamental, progress.understanding.company_fundamental, 'company_fundamental')}
              {renderSubsection(t.financialHealth, progress.understanding.financial_health, 'financial_health')}
              {renderSubsection(t.industryContext, progress.understanding.industry_context, 'industry_context')}
            </div>
          </div>

          {/* Risks Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">{t.risks}</span>
              <span className={`text-xs ml-auto ${getProgressColor(risksProgress)}`}>
                {Math.round(risksProgress)}%
              </span>
            </div>
            <div className={`h-1 rounded-full ${getProgressBg(risksProgress)}`} style={{ width: `${risksProgress}%` }} />
            <div className="space-y-1 mt-2">
              {renderSubsection(t.companyRisks, progress.risks.company_risks, 'company_risks')}
              {renderSubsection(t.externalRisks, progress.risks.external_risks, 'external_risks')}
              {renderSubsection(t.investmentRisks, progress.risks.investment_risks, 'investment_risks')}
            </div>
          </div>

          {/* Valuation Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-foreground">{t.valuation}</span>
              <span className={`text-xs ml-auto ${getProgressColor(valuationProgress)}`}>
                {Math.round(valuationProgress)}%
              </span>
            </div>
            <div className={`h-1 rounded-full ${getProgressBg(valuationProgress)}`} style={{ width: `${valuationProgress}%` }} />
            <div className="space-y-1 mt-2">
              {renderSubsection(t.currentPrice, progress.valuation.current_price, 'current_price')}
              {renderSubsection(t.companyValuation, progress.valuation.company_valuation, 'company_valuation')}
              {renderSubsection(t.expectedReturns, progress.valuation.expected_returns, 'expected_returns')}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
