import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, TrendingUp, Gem, ChevronRight, CheckCircle2, ArrowLeft, Target, BookOpen, Send, BarChart3 } from 'lucide-react';
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

interface ResearchQuestion {
  id: string;
  text: string;
  category: 'understanding' | 'risks' | 'valuation';
  clicked: boolean;
  apiQuestionType?: 'profitability' | 'growth' | 'valuation'; // Maps to API question types
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

// 15 Research Questions - 5 per category
const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  // Understanding (5 questions)
  { id: 'u1', text: 'What does this company do?', category: 'understanding', clicked: false, apiQuestionType: 'profitability' },
  { id: 'u2', text: 'How does it make money?', category: 'understanding', clicked: false, apiQuestionType: 'profitability' },
  { id: 'u3', text: 'Who are its main customers?', category: 'understanding', clicked: false, apiQuestionType: 'profitability' },
  { id: 'u4', text: "What's its competitive advantage?", category: 'understanding', clicked: false, apiQuestionType: 'growth' },
  { id: 'u5', text: "How's the industry doing?", category: 'understanding', clicked: false, apiQuestionType: 'growth' },
  // Risks (5 questions)
  { id: 'r1', text: 'What are the biggest risks?', category: 'risks', clicked: false, apiQuestionType: 'profitability' },
  { id: 'r2', text: 'Could competition hurt them?', category: 'risks', clicked: false, apiQuestionType: 'growth' },
  { id: 'r3', text: 'Any regulatory concerns?', category: 'risks', clicked: false, apiQuestionType: 'profitability' },
  { id: 'r4', text: 'What if the economy slows?', category: 'risks', clicked: false, apiQuestionType: 'growth' },
  { id: 'r5', text: 'Is management trustworthy?', category: 'risks', clicked: false, apiQuestionType: 'valuation' },
  // Valuation (5 questions)
  { id: 'v1', text: 'Is the price fair?', category: 'valuation', clicked: false, apiQuestionType: 'valuation' },
  { id: 'v2', text: 'How does it compare to competitors?', category: 'valuation', clicked: false, apiQuestionType: 'valuation' },
  { id: 'v3', text: "What's the growth potential?", category: 'valuation', clicked: false, apiQuestionType: 'growth' },
  { id: 'v4', text: 'Are there better alternatives?', category: 'valuation', clicked: false, apiQuestionType: 'valuation' },
  { id: 'v5', text: "What's a fair price target?", category: 'valuation', clicked: false, apiQuestionType: 'valuation' },
];

export function AIAdvisorChat({ open, onOpenChange, ticker, companyName }: AIAdvisorChatProps) {
  const [screen, setScreen] = useState<ChatScreen>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [exploredQuestions, setExploredQuestions] = useState<ExploredQuestion[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedTheory, setSelectedTheory] = useState<string | null>(null);
  const [savedTheory, setSavedTheory] = useState<string | null>(null);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>(RESEARCH_QUESTIONS);
  const [showCompletion, setShowCompletion] = useState(false);
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
      setResearchQuestions(RESEARCH_QUESTIONS.map(q => ({ ...q, clicked: false })));
      setShowCompletion(false);
      
      // Initialize with welcome message
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: `🤔 Let's understand ${companyName} together.\n\nClick on any question below to get started!`
        }
      ]);
    }
  }, [open, companyName]);

  // Calculate progress for each category
  const calculateCategoryProgress = (category: 'understanding' | 'risks' | 'valuation'): number => {
    const clickedInCategory = researchQuestions.filter(q => q.category === category && q.clicked).length;
    return (clickedInCategory / 5) * 100; // 5 questions per category
  };

  // Check if all questions are completed
  const allQuestionsCompleted = researchQuestions.every(q => q.clicked);
  const remainingCount = researchQuestions.filter(q => !q.clicked).length;

  const getQuestionLabel = (type: 'profitability' | 'growth' | 'valuation') => {
    switch (type) {
      case 'profitability': return 'Is it making money?';
      case 'growth': return 'Is it growing?';
      case 'valuation': return 'Is it expensive?';
    }
  };

  const handleResearchQuestion = async (questionId: string) => {
    const question = researchQuestions.find(q => q.id === questionId);
    if (!question || question.clicked || loading) return;

    // Mark question as clicked
    setResearchQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, clicked: true } : q
    ));

    // Check if all questions are now completed
    const newClickedCount = researchQuestions.filter(q => q.clicked || q.id === questionId).length;
    if (newClickedCount === RESEARCH_QUESTIONS.length) {
      setTimeout(() => setShowCompletion(true), 1000);
    }

    // Use the API question type if available, otherwise default to valuation
    const apiQuestionType = question.apiQuestionType || 'valuation';
    await handleAskQuestion(apiQuestionType, question.text);
  };

  const handleAskQuestion = async (question: 'profitability' | 'growth' | 'valuation', customText?: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: customText || getQuestionLabel(question)
    };
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'loading'
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setLoading(true);

    try {
      // Use direct fetch with anon key for Supabase Edge Functions
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/stock-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          ticker,
          companyName,
          question,
          followUp: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data?.analysis) {
        // Remove loading message and add analysis, preserving options
        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'loading');
          const optionsMessage = prev.find(m => m.type === 'options');
          
          // Add analysis
          const updated = [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              type: 'analysis',
              analysis: data.analysis,
              questionType: question,
              showFollowUp: true
            }
          ];
          
          // Re-add options at the end if they exist, with updated explored state
          if (optionsMessage && optionsMessage.options) {
            const updatedOptions = optionsMessage.options.map(opt => 
              opt.type === question ? { ...opt, explored: true } : opt
            );
            updated.push({
              ...optionsMessage,
              options: updatedOptions
            });
          }
          
          return updated;
        });

        setExploredQuestions(prev => {
          const exists = prev.find(q => q.type === question);
          if (exists) return prev;
          return [...prev, { type: question, analysis: data.analysis }];
        });
        setXpEarned(prev => prev + 25);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.type !== 'loading');
        return [
          ...filtered,
          {
            id: (Date.now() + 3).toString(),
            type: 'ai',
            content: 'Sorry, I encountered an error. Please try again.'
          }
        ];
      });
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
      // Use direct fetch with anon key for Supabase Edge Functions
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/stock-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          ticker,
          companyName,
          question,
          followUp: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();

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
      setMessages(prev => {
        const filtered = prev.filter(m => m.type !== 'loading');
        return [
          ...filtered,
          {
            id: (Date.now() + 3).toString(),
            type: 'ai',
            content: 'Sorry, I encountered an error. Please try again.'
          }
        ];
      });
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
        { type: 'profitability', label: 'Is it making money?', icon: '', explored: exploredQuestions.some(q => q.type === 'profitability') },
        { type: 'growth', label: 'Is it growing?', icon: '', explored: exploredQuestions.some(q => q.type === 'growth') },
        { type: 'valuation', label: 'Is it expensive?', icon: '', explored: exploredQuestions.some(q => q.type === 'valuation') }
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
        <div className="flex-1 flex flex-col overflow-hidden">
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
                
                {/* Completion Celebration */}
                {showCompletion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCompletion(false)}
                  >
                    <motion.div
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="bg-card border border-border rounded-2xl p-8 max-w-md text-center shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-6xl mb-4"
                      >
                        🎉
                      </motion.div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Research Complete!</h3>
                      <p className="text-muted-foreground mb-6">
                        You've explored all aspects of {companyName}. You're ready to make an informed decision!
                      </p>
                      <Button onClick={() => setShowCompletion(false)} className="w-full">
                        Continue
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
                
                  <div ref={chatEndRef} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Research Questions Section - Always at Bottom */}
          {screen === 'chat' && researchQuestions.length > 0 && (
            <div className="flex-shrink-0 p-4 pt-0 border-t border-border bg-background">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Research Questions</h3>
                <span className="text-xs text-muted-foreground">
                  {remainingCount} remaining
                </span>
              </div>
              
              {/* Grouped by Category */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {/* Understanding Category */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-foreground">Understanding</span>
                    <span className="text-xs text-muted-foreground">
                      ({researchQuestions.filter(q => q.category === 'understanding' && q.clicked).length}/5)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence>
                      {researchQuestions
                        .filter(q => q.category === 'understanding')
                        .map((question) => (
                          <motion.button
                            key={question.id}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ 
                              opacity: question.clicked ? 0 : 1,
                              scale: question.clicked ? 0.95 : 1,
                              height: question.clicked ? 0 : 'auto'
                            }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleResearchQuestion(question.id)}
                            disabled={question.clicked || loading}
                            className={`text-left p-3 rounded-xl text-sm transition-all ${
                              question.clicked
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="text-foreground">{question.text}</span>
                          </motion.button>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Risks Category */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-foreground">Risks</span>
                    <span className="text-xs text-muted-foreground">
                      ({researchQuestions.filter(q => q.category === 'risks' && q.clicked).length}/5)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence>
                      {researchQuestions
                        .filter(q => q.category === 'risks')
                        .map((question) => (
                          <motion.button
                            key={question.id}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ 
                              opacity: question.clicked ? 0 : 1,
                              scale: question.clicked ? 0.95 : 1,
                              height: question.clicked ? 0 : 'auto'
                            }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleResearchQuestion(question.id)}
                            disabled={question.clicked || loading}
                            className={`text-left p-3 rounded-xl text-sm transition-all ${
                              question.clicked
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="text-foreground">{question.text}</span>
                          </motion.button>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Valuation Category */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-foreground">Valuation</span>
                    <span className="text-xs text-muted-foreground">
                      ({researchQuestions.filter(q => q.category === 'valuation' && q.clicked).length}/5)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence>
                      {researchQuestions
                        .filter(q => q.category === 'valuation')
                        .map((question) => (
                          <motion.button
                            key={question.id}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ 
                              opacity: question.clicked ? 0 : 1,
                              scale: question.clicked ? 0.95 : 1,
                              height: question.clicked ? 0 : 'auto'
                            }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleResearchQuestion(question.id)}
                            disabled={question.clicked || loading}
                            className={`text-left p-3 rounded-xl text-sm transition-all ${
                              question.clicked
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="text-foreground">{question.text}</span>
                          </motion.button>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Screen */}
        {screen === 'summary' && (
          <div className="flex-1 overflow-y-auto p-4">
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
