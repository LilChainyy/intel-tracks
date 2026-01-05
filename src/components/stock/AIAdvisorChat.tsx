import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, TrendingUp, Gem, ChevronRight, CheckCircle2, ArrowLeft, Target, BookOpen } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AIAdvisorChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  companyName: string;
}

interface AnalysisResult {
  headline: string;
  simpleAnswer: string;
  details: Array<{ point: string; metric: string; value: string }>;
  metrics: {
    primary: string;
    primaryValue: string;
    secondary?: string;
    secondaryValue?: string;
    comparison?: string;
    comparisonValue?: string;
  };
  analogy?: string;
  competitorComparison?: Array<{ name: string; value: number; label: string }>;
  summaryTag: string;
}

interface ExploredQuestion {
  type: 'profitability' | 'growth' | 'valuation';
  analysis: AnalysisResult;
}

type ChatScreen = 'initial' | 'question' | 'followUp' | 'summary' | 'theoryBuilder' | 'timeline';

export function AIAdvisorChat({ open, onOpenChange, ticker, companyName }: AIAdvisorChatProps) {
  const [screen, setScreen] = useState<ChatScreen>('initial');
  const [currentQuestion, setCurrentQuestion] = useState<'profitability' | 'growth' | 'valuation' | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [exploredQuestions, setExploredQuestions] = useState<ExploredQuestion[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedTheory, setSelectedTheory] = useState<string | null>(null);
  const [savedTheory, setSavedTheory] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setScreen('initial');
      setCurrentQuestion(null);
      setCurrentAnalysis(null);
      setExploredQuestions([]);
      setShowDetails(false);
      setXpEarned(0);
      setSelectedTheory(null);
    }
  }, [open]);

  const handleAskQuestion = async (question: 'profitability' | 'growth' | 'valuation', followUp = false) => {
    setLoading(true);
    setCurrentQuestion(question);
    setScreen('question');

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: { ticker, companyName, question, followUp }
      });

      if (error) throw error;

      if (data?.analysis) {
        setCurrentAnalysis(data.analysis);
        if (!followUp) {
          setExploredQuestions(prev => {
            const exists = prev.find(q => q.type === question);
            if (exists) return prev;
            return [...prev, { type: question, analysis: data.analysis }];
          });
          setXpEarned(prev => prev + 25);
        }
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    setScreen('followUp');

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: { ticker, companyName, question: currentQuestion, followUp: true }
      });

      if (error) throw error;

      if (data?.analysis) {
        setCurrentAnalysis(data.analysis);
        setXpEarned(prev => prev + 25);
      }
    } catch (error) {
      console.error('Error fetching follow-up:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToQuestions = () => {
    if (exploredQuestions.length >= 3) {
      setScreen('summary');
    } else {
      setScreen('initial');
    }
    setCurrentQuestion(null);
    setCurrentAnalysis(null);
    setShowDetails(false);
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'profitability': return <DollarSign className="w-5 h-5" />;
      case 'growth': return <TrendingUp className="w-5 h-5" />;
      case 'valuation': return <Gem className="w-5 h-5" />;
      default: return null;
    }
  };

  const isQuestionExplored = (type: string) => exploredQuestions.some(q => q.type === type);

  const theories = [
    `${companyName} is safe and reliable. Good for steady growth.`,
    `${companyName} is too expensive. I'll wait for a better price.`,
    `There's hidden growth potential here. Long-term hold.`,
    `The core business is stalling. Risky at this price.`
  ];

  const handleSaveTheory = async () => {
    if (!selectedTheory) return;
    setSavedTheory(selectedTheory);
    setScreen('timeline');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0 gap-0 bg-background border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">AI Advisor</span>
            </div>
            {xpEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 rounded-full bg-amber/20 text-amber text-xs font-medium"
              >
                +{xpEarned} XP
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-4 pb-6">
          <AnimatePresence mode="wait">
            {/* Initial Screen */}
            {screen === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center pt-4">
                  <div className="text-3xl mb-2">🤔</div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Let's understand {companyName} together.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a question to explore
                  </p>
                </div>

                <div className="space-y-3">
                  <QuestionButton
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Is it making money?"
                    explored={isQuestionExplored('profitability')}
                    onClick={() => handleAskQuestion('profitability')}
                  />
                  <QuestionButton
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Is it growing?"
                    explored={isQuestionExplored('growth')}
                    onClick={() => handleAskQuestion('growth')}
                  />
                  <QuestionButton
                    icon={<Gem className="w-5 h-5" />}
                    label="Is it expensive?"
                    explored={isQuestionExplored('valuation')}
                    onClick={() => handleAskQuestion('valuation')}
                  />
                </div>

                {exploredQuestions.length >= 3 && (
                  <Button
                    onClick={() => setScreen('summary')}
                    className="w-full"
                  >
                    📊 View Summary
                  </Button>
                )}
              </motion.div>
            )}

            {/* Question Answer Screen */}
            {(screen === 'question' || screen === 'followUp') && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing {companyName}...</p>
                  </div>
                ) : currentAnalysis ? (
                  <>
                    {/* Question Badge */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getQuestionIcon(currentQuestion!)}
                      <span className="capitalize">{currentQuestion === 'profitability' ? 'Making Money' : currentQuestion === 'growth' ? 'Growing' : 'Expensive'}</span>
                    </div>

                    {/* Simple Answer */}
                    <div className="card-surface p-4 rounded-xl">
                      <p className="text-lg font-medium text-foreground mb-2">
                        {currentAnalysis.headline}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentAnalysis.simpleAnswer}
                      </p>
                    </div>

                    {/* Metrics */}
                    {currentAnalysis.metrics && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="card-surface p-3 rounded-xl">
                          <p className="text-xs text-muted-foreground">{currentAnalysis.metrics.primary}</p>
                          <p className="text-lg font-bold text-foreground">{currentAnalysis.metrics.primaryValue}</p>
                        </div>
                        {currentAnalysis.metrics.secondary && (
                          <div className="card-surface p-3 rounded-xl">
                            <p className="text-xs text-muted-foreground">{currentAnalysis.metrics.secondary}</p>
                            <p className="text-lg font-bold text-foreground">{currentAnalysis.metrics.secondaryValue}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detailed Breakdown */}
                    {showDetails && currentAnalysis.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        {currentAnalysis.details.map((detail, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{idx + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm text-foreground">{detail.point}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {detail.metric}: <span className="font-medium">{detail.value}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Analogy */}
                    {currentAnalysis.analogy && (
                      <div className="card-surface p-4 rounded-xl border-l-4 border-primary">
                        <p className="text-sm text-muted-foreground italic">
                          💡 {currentAnalysis.analogy}
                        </p>
                      </div>
                    )}

                    {/* Competitor Comparison */}
                    {currentAnalysis.competitorComparison && currentAnalysis.competitorComparison.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Compared to peers</p>
                        {currentAnalysis.competitorComparison.map((comp, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-sm text-foreground w-20 truncate">{comp.name}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(comp.value, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">{comp.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {!showDetails && screen === 'question' && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowDetails(true);
                            handleFollowUp();
                          }}
                        >
                          Yes, tell me why! <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      
                      {currentQuestion === 'growth' && screen === 'followUp' && !currentAnalysis.analogy && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleFollowUp}
                        >
                          Tell me what this means
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={handleBackToQuestions}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Ask something else
                      </Button>
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}

            {/* Summary Screen */}
            {screen === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="text-center pt-2">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Let's understand {companyName} together
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Here's what we learned
                  </p>
                </div>

                {/* Summary Tags */}
                <div className="flex flex-wrap gap-2">
                  {exploredQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      {q.analysis.summaryTag}
                    </div>
                  ))}
                </div>

                {/* Expandable Evidence */}
                <div className="space-y-3">
                  {exploredQuestions.map((q, idx) => (
                    <div key={idx} className="card-surface rounded-xl overflow-hidden">
                      <button
                        className="w-full p-4 flex items-center justify-between text-left"
                        onClick={() => {
                          setCurrentQuestion(q.type);
                          setCurrentAnalysis(q.analysis);
                          setScreen('question');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {getQuestionIcon(q.type)}
                          <span className="font-medium text-foreground capitalize">
                            {q.type === 'profitability' ? 'Making Money' : q.type === 'growth' ? 'Growing' : 'Expensive'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full"
                    onClick={() => setScreen('theoryBuilder')}
                  >
                    📝 Form My Investment Theory
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => setScreen('initial')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Ask More Questions
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Theory Builder Screen */}
            {screen === 'theoryBuilder' && (
              <motion.div
                key="theoryBuilder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="text-center pt-2">
                  <div className="text-3xl mb-2">🎯</div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Let's Build Your {companyName} Theory
                  </h2>
                </div>

                {/* What we learned */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">We've learned that {companyName} is:</p>
                  <div className="flex flex-wrap gap-2">
                    {exploredQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                      >
                        {q.analysis.summaryTag}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theory Selection */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Based on this, which story fits best?</p>
                  {theories.map((theory, idx) => (
                    <button
                      key={idx}
                      className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
                        selectedTheory === theory
                          ? 'bg-primary text-primary-foreground'
                          : 'card-surface text-foreground hover:bg-secondary'
                      }`}
                      onClick={() => setSelectedTheory(theory)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedTheory === theory ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'
                        }`}>
                          {selectedTheory === theory && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {theory}
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedTheory}
                  onClick={handleSaveTheory}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Save My Theory
                </Button>
              </motion.div>
            )}

            {/* Timeline Screen */}
            {screen === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="text-center pt-2">
                  <div className="text-3xl mb-2">📖</div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Your {companyName} Story Evolution
                  </h2>
                </div>

                {/* Current Theory */}
                <div className="card-surface p-4 rounded-xl border-l-4 border-primary">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-medium">TODAY</span>
                    <span>•</span>
                    <span>CURRENT THEORY</span>
                  </div>
                  <div className="flex items-start gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground font-medium">"{savedTheory}"</p>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium text-foreground">65%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Why I believe this:</p>
                    {exploredQuestions.slice(0, 3).map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>{q.analysis.summaryTag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Journey Stats */}
                <div className="card-surface p-4 rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-3">Your Journey</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Questions asked</p>
                        <p className="font-bold text-foreground">{exploredQuestions.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Level</p>
                        <p className="font-bold text-foreground">Beginner</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Research time</p>
                        <p className="font-bold text-foreground">~2 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏆</span>
                      <div>
                        <p className="text-xs text-muted-foreground">XP earned</p>
                        <p className="font-bold text-foreground">{xpEarned} XP</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScreen('theoryBuilder')}
                  >
                    Update Theory
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface QuestionButtonProps {
  icon: React.ReactNode;
  label: string;
  explored: boolean;
  onClick: () => void;
}

function QuestionButton({ icon, label, explored, onClick }: QuestionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
        explored 
          ? 'card-surface border-success/30 bg-success/5' 
          : 'card-surface hover:bg-secondary'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          explored ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
        }`}>
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {explored ? (
        <CheckCircle2 className="w-5 h-5 text-success" />
      ) : (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}
