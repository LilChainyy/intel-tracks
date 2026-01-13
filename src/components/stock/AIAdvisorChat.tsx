import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, TrendingUp, Gem, ChevronRight, CheckCircle2, ArrowLeft, Target, BookOpen, Send } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

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

interface ChatMessage {
  id: string;
  type: 'ai' | 'user' | 'options' | 'analysis' | 'loading';
  content?: string;
  options?: Array<{
    type: 'profitability' | 'growth' | 'valuation';
    label: string;
    icon: string;
    explored: boolean;
  }>;
  analysis?: AnalysisResult;
  questionType?: 'profitability' | 'growth' | 'valuation';
  showFollowUp?: boolean;
}

type ChatScreen = 'chat' | 'summary' | 'theoryBuilder' | 'timeline';

export function AIAdvisorChat({ open, onOpenChange, ticker, companyName }: AIAdvisorChatProps) {
  const { t, language } = useLanguage();
  const [screen, setScreen] = useState<ChatScreen>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [exploredQuestions, setExploredQuestions] = useState<ExploredQuestion[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedTheory, setSelectedTheory] = useState<string | null>(null);
  const [savedTheory, setSavedTheory] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setScreen('chat');
      setExploredQuestions([]);
      setXpEarned(0);
      setSelectedTheory(null);
      setSavedTheory(null);
      
      // Initialize with welcome message and options
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: language === 'zh' 
            ? `🤔 让我们一起来了解 ${companyName}。\n\n你想从哪个方面开始探索？`
            : `🤔 Let's understand ${companyName} together.\n\nWhat would you like to explore first?`
        },
        {
          id: '2',
          type: 'options',
          options: [
            { type: 'profitability', label: language === 'zh' ? '💰 它赚钱吗？' : '💰 Is it making money?', icon: '💰', explored: false },
            { type: 'growth', label: language === 'zh' ? '🚀 它在增长吗？' : '🚀 Is it growing?', icon: '🚀', explored: false },
            { type: 'valuation', label: language === 'zh' ? '💎 它贵吗？' : '💎 Is it expensive?', icon: '💎', explored: false }
          ]
        }
      ]);
    }
  }, [open, companyName, language]);

  const getQuestionLabel = (type: 'profitability' | 'growth' | 'valuation') => {
    if (language === 'zh') {
      switch (type) {
        case 'profitability': return '它赚钱吗？';
        case 'growth': return '它在增长吗？';
        case 'valuation': return '它贵吗？';
      }
    }
    switch (type) {
      case 'profitability': return 'Is it making money?';
      case 'growth': return 'Is it growing?';
      case 'valuation': return 'Is it expensive?';
    }
  };

  const handleAskQuestion = async (question: 'profitability' | 'growth' | 'valuation') => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: getQuestionLabel(question)
    };
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'loading'
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: { ticker, companyName, question, followUp: false }
      });

      if (error) throw error;

      if (data?.analysis) {
        // Remove loading message and add analysis
        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'loading');
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              type: 'analysis',
              analysis: data.analysis,
              questionType: question,
              showFollowUp: true
            }
          ];
        });

        setExploredQuestions(prev => {
          const exists = prev.find(q => q.type === question);
          if (exists) return prev;
          return [...prev, { type: question, analysis: data.analysis }];
        });
        setXpEarned(prev => prev + 25);

        // Update options to show explored state
        updateOptionsExplored(question);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async (question: 'profitability' | 'growth' | 'valuation') => {
    // Add user follow-up message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: language === 'zh' ? '告诉我为什么？' : 'Tell me why?'
    };
    
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'loading'
    };

    // Remove follow-up button from previous analysis
    setMessages(prev => {
      const updated = prev.map(m => 
        m.type === 'analysis' && m.questionType === question 
          ? { ...m, showFollowUp: false }
          : m
      );
      return [...updated, userMessage, loadingMessage];
    });
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: { ticker, companyName, question, followUp: true }
      });

      if (error) throw error;

      if (data?.analysis) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'loading');
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              type: 'analysis',
              analysis: data.analysis,
              questionType: question,
              showFollowUp: false
            }
          ];
        });
        setXpEarned(prev => prev + 25);
      }
    } catch (error) {
      console.error('Error fetching follow-up:', error);
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
    } finally {
      setLoading(false);
    }
  };

  const updateOptionsExplored = (exploredType: 'profitability' | 'growth' | 'valuation') => {
    setMessages(prev => prev.map(m => {
      if (m.type === 'options' && m.options) {
        return {
          ...m,
          options: m.options.map(opt => 
            opt.type === exploredType ? { ...opt, explored: true } : opt
          )
        };
      }
      return m;
    }));
  };

  const handleShowMoreOptions = () => {
    const newOptions: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: language === 'zh' 
        ? '还想了解什么？' 
        : 'What else would you like to know?'
    };
    
    const optionsMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'options',
      options: [
        { type: 'profitability', label: language === 'zh' ? '💰 它赚钱吗？' : '💰 Is it making money?', icon: '💰', explored: exploredQuestions.some(q => q.type === 'profitability') },
        { type: 'growth', label: language === 'zh' ? '🚀 它在增长吗？' : '🚀 Is it growing?', icon: '🚀', explored: exploredQuestions.some(q => q.type === 'growth') },
        { type: 'valuation', label: language === 'zh' ? '💎 它贵吗？' : '💎 Is it expensive?', icon: '💎', explored: exploredQuestions.some(q => q.type === 'valuation') }
      ]
    };

    setMessages(prev => [...prev, newOptions, optionsMessage]);
  };

  const theories = [
    language === 'zh' 
      ? `${companyName} 安全可靠，适合稳健增长。`
      : `${companyName} is safe and reliable. Good for steady growth.`,
    language === 'zh'
      ? `${companyName} 估值过高，我会等待更好的价格。`
      : `${companyName} is too expensive. I'll wait for a better price.`,
    language === 'zh'
      ? `这里有隐藏的增长潜力，适合长期持有。`
      : `There's hidden growth potential here. Long-term hold.`,
    language === 'zh'
      ? `核心业务正在放缓，当前价格风险较高。`
      : `The core business is stalling. Risky at this price.`
  ];

  const handleSaveTheory = async () => {
    if (!selectedTheory) return;
    setSavedTheory(selectedTheory);
    setScreen('timeline');
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'profitability': return <DollarSign className="w-4 h-4" />;
      case 'growth': return <TrendingUp className="w-4 h-4" />;
      case 'valuation': return <Gem className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[85vh] flex flex-col p-0 gap-0 bg-background border-border">
        {/* Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-foreground">AI Advisor</span>
                <p className="text-xs text-muted-foreground">{ticker}</p>
              </div>
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

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {screen === 'chat' && (
              <>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                          <p className="text-sm text-foreground whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    )}

                    {message.type === 'user' && (
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}

                    {message.type === 'options' && message.options && (
                      <div className="w-full space-y-2">
                        {message.options.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => !loading && handleAskQuestion(option.type)}
                            disabled={loading}
                            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                              option.explored 
                                ? 'bg-success/10 border border-success/30' 
                                : 'bg-secondary hover:bg-secondary/80'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className="text-sm font-medium text-foreground">{option.label}</span>
                            {option.explored ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {message.type === 'loading' && (
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === 'analysis' && message.analysis && (
                      <div className="flex gap-2 w-full">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          {/* Main answer bubble */}
                          <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              {message.analysis.headline}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {message.analysis.simpleAnswer}
                            </p>
                          </div>

                          {/* Metrics */}
                          {message.analysis.metrics && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-secondary/50 p-3 rounded-xl">
                                <p className="text-xs text-muted-foreground">{message.analysis.metrics.primary}</p>
                                <p className="text-base font-bold text-foreground">{message.analysis.metrics.primaryValue}</p>
                              </div>
                              {message.analysis.metrics.secondary && (
                                <div className="bg-secondary/50 p-3 rounded-xl">
                                  <p className="text-xs text-muted-foreground">{message.analysis.metrics.secondary}</p>
                                  <p className="text-base font-bold text-foreground">{message.analysis.metrics.secondaryValue}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Details */}
                          {message.analysis.details && message.analysis.details.length > 0 && (
                            <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                              {message.analysis.details.map((detail, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm text-foreground">{detail.point}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {detail.metric}: <span className="font-medium">{detail.value}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Analogy */}
                          {message.analysis.analogy && (
                            <div className="bg-primary/5 border-l-2 border-primary rounded-r-xl px-3 py-2">
                              <p className="text-sm text-muted-foreground italic">
                                💡 {message.analysis.analogy}
                              </p>
                            </div>
                          )}

                          {/* Competitor Comparison */}
                          {message.analysis.competitorComparison && message.analysis.competitorComparison.length > 0 && (
                            <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {language === 'zh' ? '同行对比' : 'Compared to peers'}
                              </p>
                              {message.analysis.competitorComparison.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-xs text-foreground w-16 truncate">{comp.name}</span>
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${Math.min(comp.value, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-12 text-right">{comp.label}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Follow-up button */}
                          {message.showFollowUp && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => message.questionType && handleFollowUp(message.questionType)}
                              disabled={loading}
                            >
                              {language === 'zh' ? '告诉我为什么？' : 'Tell me why?'} <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </>
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
                    {language === 'zh' ? `让我们一起了解 ${companyName}` : `Let's understand ${companyName} together`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' ? '以下是我们的发现' : "Here's what we learned"}
                  </p>
                </div>

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

                <div className="space-y-3">
                  {exploredQuestions.map((q, idx) => (
                    <div key={idx} className="card-surface rounded-xl overflow-hidden">
                      <button
                        className="w-full p-4 flex items-center justify-between text-left"
                        onClick={() => setScreen('chat')}
                      >
                        <div className="flex items-center gap-2">
                          {getQuestionIcon(q.type)}
                          <span className="font-medium text-foreground capitalize">
                            {q.type === 'profitability' 
                              ? (language === 'zh' ? '盈利能力' : 'Making Money')
                              : q.type === 'growth' 
                              ? (language === 'zh' ? '增长情况' : 'Growing')
                              : (language === 'zh' ? '估值分析' : 'Expensive')}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full"
                    onClick={() => setScreen('theoryBuilder')}
                  >
                    📝 {language === 'zh' ? '形成我的投资理论' : 'Form My Investment Theory'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => setScreen('chat')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {language === 'zh' ? '继续提问' : 'Ask More Questions'}
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
                    {language === 'zh' ? `构建你的 ${companyName} 理论` : `Let's Build Your ${companyName} Theory`}
                  </h2>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' ? `我们了解到 ${companyName} 是：` : `We've learned that ${companyName} is:`}
                  </p>
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {language === 'zh' ? '基于此，哪个观点最合适？' : 'Based on this, which story fits best?'}
                  </p>
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
                  {language === 'zh' ? '保存我的理论' : 'Save My Theory'}
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
                    {language === 'zh' ? `你的 ${companyName} 观点演变` : `Your ${companyName} Story Evolution`}
                  </h2>
                </div>

                <div className="card-surface p-4 rounded-xl border-l-4 border-primary">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-medium">{language === 'zh' ? '今天' : 'TODAY'}</span>
                    <span>•</span>
                    <span>{language === 'zh' ? '当前理论' : 'CURRENT THEORY'}</span>
                  </div>
                  <div className="flex items-start gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground font-medium">"{savedTheory}"</p>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{language === 'zh' ? '信心度' : 'Confidence'}</span>
                      <span className="font-medium text-foreground">65%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      {language === 'zh' ? '我相信这个的原因：' : 'Why I believe this:'}
                    </p>
                    {exploredQuestions.slice(0, 3).map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>{q.analysis.summaryTag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-surface p-4 rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-3">
                    {language === 'zh' ? '你的旅程' : 'Your Journey'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'zh' ? '提问数' : 'Questions asked'}
                        </p>
                        <p className="font-bold text-foreground">{exploredQuestions.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'zh' ? '等级' : 'Level'}
                        </p>
                        <p className="font-bold text-foreground">{language === 'zh' ? '初学者' : 'Beginner'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'zh' ? '研究时间' : 'Research time'}
                        </p>
                        <p className="font-bold text-foreground">~2 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏆</span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'zh' ? '获得经验' : 'XP earned'}
                        </p>
                        <p className="font-bold text-foreground">{xpEarned} XP</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScreen('theoryBuilder')}
                  >
                    {language === 'zh' ? '更新理论' : 'Update Theory'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                  >
                    {language === 'zh' ? '完成' : 'Done'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Action Bar */}
        {screen === 'chat' && !loading && exploredQuestions.length > 0 && (
          <div className="flex-shrink-0 border-t border-border p-3 bg-background space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleShowMoreOptions}
            >
              {language === 'zh' ? '问其他问题' : 'Ask another question'}
            </Button>
            {exploredQuestions.length >= 3 && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setScreen('summary')}
              >
                📊 {language === 'zh' ? '查看总结' : 'View Summary'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
