import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, PanelRightClose, PanelRightOpen, X, Loader2, BarChart3 } from 'lucide-react';
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

interface AIAdvisorChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  companyName: string;
}

export function AIAdvisorChat({ open, onOpenChange, ticker, companyName }: AIAdvisorChatProps) {
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowSummary(!isMobile);
  }, [isMobile]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setProgress(INITIAL_PROGRESS);
      setSavedThesis(null);
      
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `👋 Hi! I'm your investment advisor. Let's explore **${companyName} (${ticker})** together.\n\nI'll help you understand this company, identify risks, and evaluate if it's worth investing in.\n\nAsk me anything, or click a suggestion below to get started!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      const initialQuestions: SuggestedQuestion[] = [
        { text: 'What does it do?', category: 'understanding' },
        { text: 'Biggest risks?', category: 'risks' },
        { text: 'Is price fair?', category: 'valuation' },
      ];
      setSuggestedQuestions(initialQuestions);

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, companyName, ticker]);

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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/company-advisor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: history,
          ticker,
          companyName,
          progress,
          language: 'en',
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
          language: 'en',
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
    sendMessage(question.text);
  };

  const handleAskAbout = (topic: string) => {
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
      sendMessage(input);
    }
  };

  const overallProgress = calculateOverallProgress(progress);

  const handleToggleSummary = () => {
    if (isMobile) {
      setShowMobileSummary(true);
    } else {
      setShowSummary(!showSummary);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-full h-[95vh] md:h-[90vh] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden">
          <div className="flex flex-1 min-h-0 h-full">
            {/* Main Chat Area */}
            <div className={`flex flex-col h-full ${showSummary && !isMobile ? 'md:w-[70%]' : 'w-full'} transition-all duration-300`}>
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
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleSummary}
                        className="text-muted-foreground hover:text-foreground gap-1 px-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs">{Math.round(overallProgress)}%</span>
                      </Button>
                    )}
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleSummary}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showSummary ? (
                          <PanelRightClose className="w-5 h-5" />
                        ) : (
                          <PanelRightOpen className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenChange(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </Button>
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

              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && !isLoading && (
                <div className="flex-shrink-0 px-3 md:px-4 pb-2">
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {suggestedQuestions.map((q, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(q)}
                          className="whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
                        >
                          {q.text}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
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
