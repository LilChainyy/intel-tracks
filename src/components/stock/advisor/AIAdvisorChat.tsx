import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, PanelRightClose, PanelRightOpen, X, Loader2, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
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
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // Default closed on mobile
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(INITIAL_PROGRESS);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [showThesisBuilder, setShowThesisBuilder] = useState(false);
  const [savedThesis, setSavedThesis] = useState<ThesisChoice | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set summary panel default based on screen size
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
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: language === 'zh'
          ? `👋 你好！我是你的投资顾问。让我们一起了解 **${companyName} (${ticker})**。\n\n我会帮助你理解这家公司，识别风险，评估它是否值得投资。\n\n你可以问我任何问题，或者点击下面的建议开始！`
          : `👋 Hi! I'm your investment advisor. Let's explore **${companyName} (${ticker})** together.\n\nI'll help you understand this company, identify risks, and evaluate if it's worth investing in.\n\nAsk me anything, or click a suggestion below to get started!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      // Set initial suggested questions
      const initialQuestions: SuggestedQuestion[] = language === 'zh'
        ? [
            { text: `${companyName} 是做什么的？`, category: 'understanding' },
            { text: '最大的风险是什么？', category: 'risks' },
            { text: '现在的股价合理吗？', category: 'valuation' },
          ]
        : [
            { text: `What does ${companyName} actually do?`, category: 'understanding' },
            { text: 'What are the biggest risks?', category: 'risks' },
            { text: 'Is the stock price reasonable right now?', category: 'valuation' },
          ];
      setSuggestedQuestions(initialQuestions);

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, companyName, ticker, language]);

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
      // Build conversation history (last 6 messages)
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
          language,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(language === 'zh' ? '请求太频繁，请稍后再试' : 'Too many requests, please try again later');
          throw new Error('Rate limited');
        }
        if (response.status === 402) {
          toast.error(language === 'zh' ? '需要充值' : 'Payment required');
          throw new Error('Payment required');
        }
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      // Add empty assistant message that we'll update
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

        // Process complete lines
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

      // After response, update progress and get new suggestions
      await updateProgressAndSuggestions(userMessage.content, assistantContent);

    } catch (error) {
      console.error('Chat error:', error);
      if (error instanceof Error && !error.message.includes('Rate limited') && !error.message.includes('Payment')) {
        toast.error(language === 'zh' ? '发送消息失败' : 'Failed to send message');
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
          language,
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
    const topicQuestions: Record<string, { en: string; zh: string }> = {
      company_fundamental: { en: `What does ${companyName} do and how does it make money?`, zh: `${companyName} 是做什么的，如何赚钱？` },
      financial_health: { en: `Is ${companyName} profitable and financially healthy?`, zh: `${companyName} 盈利吗？财务健康吗？` },
      industry_context: { en: `What industry is ${companyName} in and who are its competitors?`, zh: `${companyName} 属于什么行业？竞争对手是谁？` },
      company_risks: { en: `What are the biggest risks specific to ${companyName}?`, zh: `${companyName} 特有的最大风险是什么？` },
      external_risks: { en: 'What economic or market risks could affect this company?', zh: '哪些经济或市场风险可能影响这家公司？' },
      investment_risks: { en: 'How volatile is this stock and what should I consider for risk management?', zh: '这只股票波动性如何？风险管理需要考虑什么？' },
      current_price: { en: `What is ${companyName}'s current stock price and how has it performed?`, zh: `${companyName} 当前股价是多少？表现如何？` },
      company_valuation: { en: `Is ${companyName} expensive compared to its earnings and competitors?`, zh: `相比盈利和竞争对手，${companyName} 贵吗？` },
      expected_returns: { en: 'Is the potential return worth the risks for this stock?', zh: '这只股票的潜在回报值得承担风险吗？' },
    };

    const question = topicQuestions[topic]?.[language] || topicQuestions[topic]?.en;
    if (question) {
      sendMessage(question);
    }
  };

  const handleSaveThesis = (thesis: ThesisChoice) => {
    setSavedThesis(thesis);
    
    const stanceLabels = {
      bullish: language === 'zh' ? '看涨' : 'bullish',
      neutral: language === 'zh' ? '中性' : 'neutral',
      bearish: language === 'zh' ? '看跌' : 'bearish',
      custom: language === 'zh' ? '自定义' : 'custom',
    };

    const confirmMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: language === 'zh'
        ? `✅ 论点已保存！你对 **${companyName}** 持${stanceLabels[thesis.stance]}态度。你可以继续聊天或随时更新你的论点。`
        : `✅ Thesis saved! You're **${stanceLabels[thesis.stance]}** on **${companyName}**. You can continue chatting or update your thesis anytime.`,
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
        <DialogContent className="max-w-5xl w-[95vw] md:w-full h-[95vh] md:h-[90vh] p-0 gap-0 bg-background border-border overflow-hidden">
          <div className="flex h-full">
            {/* Main Chat Area */}
            <div className={`flex flex-col w-full ${showSummary && !isMobile ? 'md:w-[70%]' : 'w-full'} transition-all duration-300`}>
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
                    {/* Progress indicator for mobile */}
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
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
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
                                      {language === 'zh' ? '正在思考...' : 'Thinking...'}
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
                <div className="px-3 md:px-4 py-2 border-t border-border overflow-x-auto">
                  <div className="flex md:flex-wrap gap-2 max-w-3xl mx-auto">
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="px-3 py-2 text-xs md:text-sm bg-secondary hover:bg-secondary/80 rounded-full text-foreground transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {question.text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex-shrink-0 p-3 md:p-4 border-t border-border">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'zh' ? '输入你的问题...' : 'Type your question...'}
                    disabled={isLoading}
                    className="flex-1 text-sm md:text-base"
                  />
                  <Button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Summary Panel (30%) */}
            {!isMobile && (
              <AnimatePresence>
                {showSummary && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '30%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-border overflow-hidden hidden md:block"
                  >
                    <SummaryPanel
                      progress={progress}
                      onAskAbout={handleAskAbout}
                      onBuildThesis={() => setShowThesisBuilder(true)}
                      companyName={companyName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Summary Sheet */}
      <Sheet open={showMobileSummary} onOpenChange={setShowMobileSummary}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{language === 'zh' ? '学习进度' : 'Learning Progress'}</SheetTitle>
          </SheetHeader>
          <SummaryPanel
            progress={progress}
            onAskAbout={(topic) => {
              setShowMobileSummary(false);
              handleAskAbout(topic);
            }}
            onBuildThesis={() => {
              setShowMobileSummary(false);
              setShowThesisBuilder(true);
            }}
            companyName={companyName}
          />
        </SheetContent>
      </Sheet>

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
