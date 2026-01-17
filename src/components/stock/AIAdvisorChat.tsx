import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, TrendingUp, Gem, ChevronRight, CheckCircle2, ArrowLeft, Target, BookOpen, Send } from 'lucide-react';
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
          content: `🤔 Let's understand ${companyName} together.\n\nWhat would you like to explore first?`
        },
        {
          id: '2',
          type: 'options',
          options: [
            { type: 'profitability', label: '💰 Is it making money?', icon: '💰', explored: false },
            { type: 'growth', label: '🚀 Is it growing?', icon: '🚀', explored: false },
            { type: 'valuation', label: '💎 Is it expensive?', icon: '💎', explored: false }
          ]
        }
      ]);
    }
  }, [open, companyName]);

  const getQuestionLabel = (type: 'profitability' | 'growth' | 'valuation') => {
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
      content: 'Tell me why?'
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
      content: 'What else would you like to know?'
    };
    
    const optionsMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'options',
      options: [
        { type: 'profitability', label: '💰 Is it making money?', icon: '💰', explored: exploredQuestions.some(q => q.type === 'profitability') },
        { type: 'growth', label: '🚀 Is it growing?', icon: '🚀', explored: exploredQuestions.some(q => q.type === 'growth') },
        { type: 'valuation', label: '💎 Is it expensive?', icon: '💎', explored: exploredQuestions.some(q => q.type === 'valuation') }
      ]
    };

    setMessages(prev => [...prev, newOptions, optionsMessage]);
  };

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
                                      {detail.metric}: {detail.value}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Follow-up button */}
                          {message.showFollowUp && message.questionType && (
                            <button
                              onClick={() => handleFollowUp(message.questionType!)}
                              disabled={loading}
                              className="text-sm text-primary hover:underline disabled:opacity-50"
                            >
                              Tell me more →
                            </button>
                          )}

                          {/* Show more options */}
                          {!message.showFollowUp && (
                            <div className="flex gap-2">
                              <button
                                onClick={handleShowMoreOptions}
                                className="text-sm text-primary hover:underline"
                              >
                                Explore more →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}

            {screen === 'summary' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('chat')} className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-semibold text-lg">Your Research Summary</h2>
                </div>

                {exploredQuestions.map((q) => (
                  <div key={q.type} className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getQuestionIcon(q.type)}
                      <span className="font-medium capitalize">{q.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{q.analysis.summaryTag}</p>
                  </div>
                ))}

                <Button
                  onClick={() => setScreen('theoryBuilder')}
                  className="w-full"
                  disabled={exploredQuestions.length === 0}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Build Your Theory
                </Button>
              </motion.div>
            )}

            {screen === 'theoryBuilder' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('summary')} className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-semibold text-lg">Your Investment Theory</h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Based on your research, which theory fits your view?
                </p>

                <div className="space-y-2">
                  {theories.map((theory) => (
                    <button
                      key={theory}
                      onClick={() => setSelectedTheory(theory)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedTheory === theory
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                      }`}
                    >
                      <p className="text-sm text-foreground">{theory}</p>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleSaveTheory}
                  className="w-full"
                  disabled={!selectedTheory}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Save My Theory
                </Button>
              </motion.div>
            )}

            {screen === 'timeline' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="font-semibold text-xl">Theory Saved!</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  We'll track {companyName} and notify you of important changes that might affect your theory.
                </p>
                <div className="bg-secondary rounded-xl p-4 text-left">
                  <p className="text-xs text-muted-foreground mb-1">Your Theory</p>
                  <p className="text-sm text-foreground">{savedTheory}</p>
                </div>
                <div className="pt-4">
                  <p className="text-amber font-semibold">+{xpEarned} XP Earned!</p>
                </div>
                <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        {screen === 'chat' && exploredQuestions.length > 0 && (
          <div className="flex-shrink-0 border-t border-border p-4 bg-background">
            <Button
              onClick={() => setScreen('summary')}
              variant="outline"
              className="w-full"
            >
              View Summary ({exploredQuestions.length}/3 explored)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
