import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, PanelRightClose, PanelRightOpen, X, Loader2, BarChart3, Target, DollarSign, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { SummaryPanel } from './SummaryPanel';
import { ThesisBuilder } from './ThesisBuilder';
import { 
  Message, 
  SuggestedQuestion, 
  LearningProgress, 
  ThesisChoice,
  INITIAL_PROGRESS,
  calculateOverallProgress 
} from './types';

interface ResearchQuestion {
  id: string;
  text: string;
  category: 'understanding' | 'risks' | 'valuation';
  clicked: boolean;
}

interface AIAdvisorChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  companyName: string;
  embedded?: boolean;
}

// 15 Research Questions - 5 per category
const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  // Understanding (5 questions)
  { id: 'u1', text: 'What does this company do?', category: 'understanding', clicked: false },
  { id: 'u2', text: 'How does it make money?', category: 'understanding', clicked: false },
  { id: 'u3', text: 'Who are its main customers?', category: 'understanding', clicked: false },
  { id: 'u4', text: "What's its competitive advantage?", category: 'understanding', clicked: false },
  { id: 'u5', text: "How's the industry doing?", category: 'understanding', clicked: false },
  // Risks (5 questions)
  { id: 'r1', text: 'What are the biggest risks?', category: 'risks', clicked: false },
  { id: 'r2', text: 'Could competition hurt them?', category: 'risks', clicked: false },
  { id: 'r3', text: 'Any regulatory concerns?', category: 'risks', clicked: false },
  { id: 'r4', text: 'What if the economy slows?', category: 'risks', clicked: false },
  { id: 'r5', text: 'Is management trustworthy?', category: 'risks', clicked: false },
  // Valuation (5 questions)
  { id: 'v1', text: 'Is the price fair?', category: 'valuation', clicked: false },
  { id: 'v2', text: 'How does it compare to competitors?', category: 'valuation', clicked: false },
  { id: 'v3', text: "What's the growth potential?", category: 'valuation', clicked: false },
  { id: 'v4', text: 'Are there better alternatives?', category: 'valuation', clicked: false },
  { id: 'v5', text: "What's a fair price target?", category: 'valuation', clicked: false },
];

export function AIAdvisorChat({ open, onOpenChange, ticker, companyName, embedded = false }: AIAdvisorChatProps) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(INITIAL_PROGRESS);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [showThesisBuilder, setShowThesisBuilder] = useState(false);
  const [savedThesis, setSavedThesis] = useState<ThesisChoice | null>(null);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>(RESEARCH_QUESTIONS);
  const [showCompletion, setShowCompletion] = useState(false);
  // Track current question index for each category
  const [questionIndices, setQuestionIndices] = useState({
    understanding: 0,
    risks: 0,
    valuation: 0,
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Prevent embedded mode from forcing the *page* to scroll on mount/company change.
  // We only autoscroll after the user starts interacting with the chat.
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    setShowSummary(!isMobile);
  }, [isMobile]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // In embedded mode, avoid scrollIntoView until user interacts.
    // scrollIntoView can scroll the document to the chat section, which is not desired on profile load.
    if (embedded && !hasInteractedRef.current) return;
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open || embedded) {
      // Reset interaction state when opening / switching company
      hasInteractedRef.current = false;

      setMessages([]);
      setProgress(INITIAL_PROGRESS);
      setSavedThesis(null);
      setResearchQuestions(RESEARCH_QUESTIONS.map(q => ({ ...q, clicked: false })));
      setShowCompletion(false);
      setQuestionIndices({ understanding: 0, risks: 0, valuation: 0 });
      
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `👋 Hi! I'm your investment advisor. Let's explore **${companyName} (${ticker})** together.\n\nI'll help you understand this company, identify risks, and evaluate if it's worth investing in.\n\nClick on any question below to get started!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setSuggestedQuestions([]);

      // Only auto-focus if not embedded (to prevent scroll-to-bottom on page load)
      if (!embedded) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [open, embedded, companyName, ticker]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages.slice(-6), userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/company-advisor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          messages: history,
          ticker,
          companyName,
          progress,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Too many requests, please try again later');
          throw new Error('Rate limited');
        }
        if (response.status === 402) {
          toast.error('Payment required');
          throw new Error('Payment required');
        }
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      await updateProgressAndSuggestions(userMessage.content, assistantContent);

    } catch (error) {
      console.error('Chat error:', error);
      if (error instanceof Error && !error.message.includes('Rate limited') && !error.message.includes('Payment')) {
        toast.error('Failed to send message');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgressAndSuggestions = async (userQuestion: string, aiResponse: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-learning', {
        body: {
          userQuestion,
          aiResponse,
          ticker,
          companyName,
          currentProgress: progress,
        },
      });

      if (error) throw error;

      if (data?.progressUpdate) {
        const { category, subcategory, summary } = data.progressUpdate;
        
        setProgress(prev => {
          const newProgress = JSON.parse(JSON.stringify(prev)) as LearningProgress;
          
          if (category === 'understanding' && subcategory in newProgress.understanding) {
            const sub = newProgress.understanding[subcategory as keyof typeof newProgress.understanding];
            sub.questionsAsked += 1;
            if (summary && !sub.summaryPoints.includes(summary)) {
              sub.summaryPoints.push(summary);
            }
          } else if (category === 'risks' && subcategory in newProgress.risks) {
            const sub = newProgress.risks[subcategory as keyof typeof newProgress.risks];
            sub.questionsAsked += 1;
            if (summary && !sub.summaryPoints.includes(summary)) {
              sub.summaryPoints.push(summary);
            }
          } else if (category === 'valuation' && subcategory in newProgress.valuation) {
            const sub = newProgress.valuation[subcategory as keyof typeof newProgress.valuation];
            sub.questionsAsked += 1;
            if (summary && !sub.summaryPoints.includes(summary)) {
              sub.summaryPoints.push(summary);
            }
          }
          
          return newProgress;
        });
      }

      if (data?.suggestedQuestions) {
        setSuggestedQuestions(data.suggestedQuestions);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleSuggestedQuestion = (question: SuggestedQuestion) => {
    hasInteractedRef.current = true;
    sendMessage(question.text);
  };

  const handleResearchQuestion = async (category: 'understanding' | 'risks' | 'valuation') => {
    if (isLoading) return;

    const categoryQuestions = RESEARCH_QUESTIONS.filter(q => q.category === category);
    const currentIndex = questionIndices[category];
    
    // Check if category is exhausted
    if (currentIndex >= categoryQuestions.length) return;

    const question = categoryQuestions[currentIndex];
    hasInteractedRef.current = true;

    // Advance to next question in this category
    setQuestionIndices(prev => ({
      ...prev,
      [category]: prev[category] + 1
    }));

    // Mark question as clicked
    setResearchQuestions(prev => prev.map(q => 
      q.id === question.id ? { ...q, clicked: true } : q
    ));

    // Check if all questions are now completed
    const newClickedCount = researchQuestions.filter(q => q.clicked).length + 1;
    if (newClickedCount === RESEARCH_QUESTIONS.length) {
      setTimeout(() => setShowCompletion(true), 1000);
    }

    // Progress will be updated by the useEffect that watches questionIndices
    // No need to update here since we're updating questionIndices above

    // Send the question
    await sendMessage(question.text);
  };

  // Get current question for each category
  const getCurrentQuestion = (category: 'understanding' | 'risks' | 'valuation') => {
    const categoryQuestions = RESEARCH_QUESTIONS.filter(q => q.category === category);
    const index = questionIndices[category];
    return index < categoryQuestions.length ? categoryQuestions[index] : null;
  };

  // Check if category is exhausted
  const isCategoryExhausted = (category: 'understanding' | 'risks' | 'valuation') => {
    const categoryQuestions = RESEARCH_QUESTIONS.filter(q => q.category === category);
    return questionIndices[category] >= categoryQuestions.length;
  };

  // Calculate progress for each category
  const calculateCategoryProgress = (category: 'understanding' | 'risks' | 'valuation'): number => {
    const clickedInCategory = researchQuestions.filter(q => q.category === category && q.clicked).length;
    return (clickedInCategory / 5) * 100; // 5 questions per category
  };

  const remainingCount = researchQuestions.filter(q => !q.clicked).length;
  const allQuestionsCompleted = researchQuestions.every(q => q.clicked);

  const handleAskAbout = (topic: string) => {
    hasInteractedRef.current = true;
    const topicQuestions: Record<string, string> = {
      company_fundamental: `What does ${companyName} do and how does it make money?`,
      financial_health: `Is ${companyName} profitable and financially healthy?`,
      industry_context: `What industry is ${companyName} in and who are its competitors?`,
      company_risks: `What are the biggest risks specific to ${companyName}?`,
      external_risks: 'What economic or market risks could affect this company?',
      investment_risks: 'How volatile is this stock and what should I consider for risk management?',
      current_price: `What is ${companyName}'s current stock price and how has it performed?`,
      company_valuation: `Is ${companyName} expensive compared to its earnings and competitors?`,
      expected_returns: 'Is the potential return worth the risks for this stock?',
    };

    const question = topicQuestions[topic];
    if (question) {
      sendMessage(question);
    }
  };

  const handleSaveThesis = (thesis: ThesisChoice) => {
    setSavedThesis(thesis);
    
    const stanceLabels = {
      bullish: 'bullish',
      neutral: 'neutral',
      bearish: 'bearish',
      custom: 'custom',
    };

    const confirmMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Thesis saved! You're **${stanceLabels[thesis.stance]}** on **${companyName}**. You can continue chatting or update your thesis anytime.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      hasInteractedRef.current = true;
      sendMessage(input);
    }
  };

  // Calculate progress based on research questions clicked
  const understandingProgress = calculateCategoryProgress('understanding');
  const risksProgress = calculateCategoryProgress('risks');
  const valuationProgress = calculateCategoryProgress('valuation');
  const overallProgress = (understandingProgress + risksProgress + valuationProgress) / 3;
  
  // Update progress state to match research questions for SummaryPanel
  // Each category has 5 questions = 100% progress
  // Distribute questions evenly across 3 subsections so progress bars fill correctly
  useEffect(() => {
    const understandingClicked = questionIndices.understanding;
    const risksClicked = questionIndices.risks;
    const valuationClicked = questionIndices.valuation;
    
    setProgress(prev => {
      const newProgress = JSON.parse(JSON.stringify(prev)) as LearningProgress;
      
      // Update understanding subsections
      // Distribute 5 questions across 3 subsections: 2, 2, 1 (or similar)
      // This ensures the section progress reaches 100% when all 5 questions are asked
      const understandingSubsections = Object.keys(newProgress.understanding) as Array<keyof typeof newProgress.understanding>;
      understandingSubsections.forEach((key, idx) => {
        const sub = newProgress.understanding[key];
        // Distribute: question 0->sub0, 1->sub1, 2->sub2, 3->sub0, 4->sub1
        let count = 0;
        for (let i = 0; i < understandingClicked; i++) {
          if (i % understandingSubsections.length === idx) {
            count++;
          }
        }
        // Scale up: since we have 5 questions total but need to fill 3 subsections of 5 each
        // We'll scale so that 5 questions = all subsections at ~1.67 questions each = ~33% each = 100% section
        // Actually, let's make it simpler: each question adds to one subsection, and we calculate section progress as average
        sub.questionsAsked = count;
      });
      
      // Update risks subsections
      const risksSubsections = Object.keys(newProgress.risks) as Array<keyof typeof newProgress.risks>;
      risksSubsections.forEach((key, idx) => {
        const sub = newProgress.risks[key];
        let count = 0;
        for (let i = 0; i < risksClicked; i++) {
          if (i % risksSubsections.length === idx) {
            count++;
          }
        }
        sub.questionsAsked = count;
      });
      
      // Update valuation subsections
      const valuationSubsections = Object.keys(newProgress.valuation) as Array<keyof typeof newProgress.valuation>;
      valuationSubsections.forEach((key, idx) => {
        const sub = newProgress.valuation[key];
        let count = 0;
        for (let i = 0; i < valuationClicked; i++) {
          if (i % valuationSubsections.length === idx) {
            count++;
          }
        }
        sub.questionsAsked = count;
      });
      
      return newProgress;
    });
  }, [questionIndices]);

  const handleToggleSummary = () => {
    if (isMobile) {
      setShowMobileSummary(true);
    } else {
      setShowSummary(!showSummary);
    }
  };

  // Shared chat content
  const chatContent = (
    <div className={`flex flex-col ${embedded ? 'h-[500px]' : 'h-full'}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm md:text-base">AI Advisor</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground">{ticker} · {companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {/* Progress indicator - always show */}
            {isMobile ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSummary}
                className="text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">{Math.round(overallProgress)}%</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSummary}
                className="text-muted-foreground hover:text-foreground gap-1.5 px-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">{Math.round(overallProgress)}% Research</span>
                {showSummary ? (
                  <PanelRightClose className="w-4 h-4 ml-1" />
                ) : (
                  <PanelRightOpen className="w-4 h-4 ml-1" />
                )}
              </Button>
            )}
            {!embedded && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ScrollArea className="h-full [&>[data-radix-scroll-area-viewport]]:max-h-full">
          <div className="p-3 md:p-4 space-y-3 md:space-y-4 max-w-3xl mx-auto">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' ? (
                    <div className="flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%]">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2 md:px-4 md:py-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {message.content || (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Thinking...
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-3 py-2 md:px-4 md:py-3 max-w-[90%] md:max-w-[85%]">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-[10px] opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Research Questions - 3 Category Buttons */}
      {!isLoading && (
        <div className="flex-shrink-0 px-3 md:px-4 pb-3 border-t border-border bg-background">
          <div className="flex items-center justify-between mb-3 pt-3">
            <h3 className="text-sm font-semibold text-foreground">Research Questions</h3>
            <span className="text-xs text-muted-foreground">
              {remainingCount} remaining
            </span>
          </div>
          
          {/* 3 Category Buttons */}
          <div className="flex gap-2 flex-wrap">
            <AnimatePresence>
              {/* Understanding Button */}
              {!isCategoryExhausted('understanding') && (
                <motion.button
                  key="understanding"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleResearchQuestion('understanding')}
                  disabled={isLoading}
                  className="flex-1 min-w-[120px] p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">Understanding</span>
                  </div>
                  <p className="text-xs text-foreground text-center">
                    {getCurrentQuestion('understanding')?.text || 'Loading...'}
                  </p>
                </motion.button>
              )}

              {/* Risks Button */}
              {!isCategoryExhausted('risks') && (
                <motion.button
                  key="risks"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleResearchQuestion('risks')}
                  disabled={isLoading}
                  className="flex-1 min-w-[120px] p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-500">Risks</span>
                  </div>
                  <p className="text-xs text-foreground text-center">
                    {getCurrentQuestion('risks')?.text || 'Loading...'}
                  </p>
                </motion.button>
              )}

              {/* Valuation Button */}
              {!isCategoryExhausted('valuation') && (
                <motion.button
                  key="valuation"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleResearchQuestion('valuation')}
                  disabled={isLoading}
                  className="flex-1 min-w-[120px] p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-500">Valuation</span>
                  </div>
                  <p className="text-xs text-foreground text-center">
                    {getCurrentQuestion('valuation')?.text || 'Loading...'}
                  </p>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

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

      {/* Input */}
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-border bg-background">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this company..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // If embedded, render inline with full thinking framework
  if (embedded) {
    return (
      <>
        <div className="card-surface rounded-xl border border-border overflow-hidden">
          <div className="flex">
            {/* Main Chat Area */}
            <div className={`flex-1 ${showSummary && !isMobile ? 'md:max-w-[65%]' : 'w-full'} transition-all duration-300`}>
              {chatContent}
            </div>

            {/* Summary Panel - Desktop Embedded */}
            {showSummary && !isMobile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '35%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:block border-l border-border min-w-[260px] max-w-[320px]"
              >
                <SummaryPanel
                  progress={progress}
                  onAskAbout={handleAskAbout}
                  onBuildThesis={() => setShowThesisBuilder(true)}
                  companyName={companyName}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Summary Sheet */}
        <Sheet open={showMobileSummary} onOpenChange={setShowMobileSummary}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle>Research Progress</SheetTitle>
            </SheetHeader>
            <SummaryPanel
              progress={progress}
              onAskAbout={(topic) => {
                handleAskAbout(topic);
                setShowMobileSummary(false);
              }}
              onBuildThesis={() => {
                setShowThesisBuilder(true);
                setShowMobileSummary(false);
              }}
              companyName={companyName}
              onClose={() => setShowMobileSummary(false)}
            />
          </SheetContent>
        </Sheet>
        
        {/* Thesis Builder Dialog */}
        <ThesisBuilder
          open={showThesisBuilder}
          onOpenChange={setShowThesisBuilder}
          companyName={companyName}
          ticker={ticker}
          progress={progress}
          onSaveThesis={handleSaveThesis}
        />
      </>
    );
  }

  // Dialog mode
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-full h-[95vh] md:h-[90vh] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden">
          <div className="flex flex-1 min-h-0 h-full">
            {/* Main Chat Area */}
            <div className={`flex flex-col h-full ${showSummary && !isMobile ? 'md:w-[70%]' : 'w-full'} transition-all duration-300`}>
              {chatContent}
            </div>

            {/* Summary Panel - Desktop */}
            {showSummary && !isMobile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '30%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:block min-w-[280px] max-w-[360px] h-full"
              >
                <SummaryPanel
                  progress={progress}
                  onAskAbout={handleAskAbout}
                  onBuildThesis={() => setShowThesisBuilder(true)}
                  companyName={companyName}
                />
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Summary Sheet */}
      <Sheet open={showMobileSummary} onOpenChange={setShowMobileSummary}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>Research Progress</SheetTitle>
          </SheetHeader>
          <SummaryPanel
            progress={progress}
            onAskAbout={(topic) => {
              handleAskAbout(topic);
              setShowMobileSummary(false);
            }}
            onBuildThesis={() => {
              setShowThesisBuilder(true);
              setShowMobileSummary(false);
            }}
            companyName={companyName}
            onClose={() => setShowMobileSummary(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Thesis Builder Dialog */}
      <ThesisBuilder
        open={showThesisBuilder}
        onOpenChange={setShowThesisBuilder}
        companyName={companyName}
        ticker={ticker}
        progress={progress}
        onSaveThesis={handleSaveThesis}
      />
    </>
  );
}
