import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Bot, User, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { calculateMatchScore } from '@/utils/matchScore';
import { convertToUserProfile } from '@/utils/investorScoring';
import { supabase } from '@/integrations/supabase/client';
import { SummaryPanel } from '@/components/stock/advisor/SummaryPanel';
import { ThesisBuilder } from '@/components/stock/advisor/ThesisBuilder';
import { calculateOverallProgress, type LearningProgress, type ThesisChoice, INITIAL_PROGRESS } from '@/components/stock/advisor/types';
import type { Playlist } from '@/types/playlist';
import { FollowUpButtons, type FollowUpOption } from '@/components/advisor/FollowUpButtons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  followUps?: FollowUpOption[];
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your AI Advisor — the brain behind Adamsmyth. Ask me about any company, industry, or investment opportunity.",
};

const STARTER_CHIPS = [
  'Find buy dip opportunities',
  'High growth stocks',
  'Compare two companies',
  'Explain an industry',
];

export function AdvisorScreen() {
  const { state } = useInvestorQuiz();
  const { setSelectedPlaylist, setCurrentScreen, setActiveTab, advisorFocusedTicker, setAdvisorFocusedTicker, selectedStock, selectedPlaylist } = useApp();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [topPlaylists, setTopPlaylists] = useState<Playlist[] | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [progress, setProgress] = useState<LearningProgress>(INITIAL_PROGRESS);
  const [showThesisBuilder, setShowThesisBuilder] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [savedThesis, setSavedThesis] = useState<ThesisChoice | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ticker = advisorFocusedTicker ?? null;
  const companyName = ticker ? (selectedPlaylist?.stocks.find((s) => s.ticker === ticker)?.name ?? ticker) : '';

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('company-list');
    setActiveTab('theme');
  };

  const overallProgress = calculateOverallProgress(progress);

  // Fetch progress from progress_state when ticker is set
  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    async function loadProgress() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id || cancelled) return;
      const { data } = await supabase
        .from('progress_state')
        .select('understanding, risks, valuation')
        .eq('user_id', session.session.user.id)
        .eq('ticker', ticker)
        .single();
      if (!cancelled && data) {
        setProgress({
          understanding: data.understanding ?? INITIAL_PROGRESS.understanding,
          risks: data.risks ?? INITIAL_PROGRESS.risks,
          valuation: data.valuation ?? INITIAL_PROGRESS.valuation,
        });
      }
    }
    loadProgress();
    return () => { cancelled = true; };
  }, [ticker]);

  // Company-mode welcome when ticker pre-filled
  useEffect(() => {
    if (ticker && companyName && messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your investment advisor. Let's explore **${companyName} (${ticker})** together. Click a question below or ask anything!`,
      }]);
    }
  }, [ticker, companyName]);

  // Show post-quiz welcome with top 3 playlists when landing from quiz completion
  useEffect(() => {
    if (sessionStorage.getItem('advisor_from_quiz') !== '1') return;
    if (!state.isComplete || !state.calculatedScores) return;

    const userProfile = convertToUserProfile(state.calculatedScores);
    const scored = playlists.map((p) => ({
      ...p,
      matchScore: calculateMatchScore(userProfile, { ...p, id: p.id }),
    }));
    const top3 = scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 3);
    setTopPlaylists(top3);
    setMessages([{ id: 'welcome', role: 'assistant', content: 'Do these sound interesting to you?' }]);
    sessionStorage.removeItem('advisor_from_quiz');
  }, [state.isComplete, state.calculatedScores]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestedQuestions([]);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const body: Record<string, unknown> = { messages: apiMessages };
      if (ticker) body.ticker = ticker;
      if (companyName) body.companyName = companyName;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-chat-v3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many requests. Please try again later.');
        throw new Error('An error occurred. Please try again.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
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
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);

              // Handle follow-up options from advisor-chat-v3
              if (parsed.type === 'follow_ups') {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, followUps: parsed.options } : m))
                );
                continue;
              }

              if (parsed.type === 'advisor_metadata') {
                if (Array.isArray(parsed.suggested_questions)) setSuggestedQuestions(parsed.suggested_questions);
                if (parsed.classification && ticker) {
                  setProgress((prev) => {
                    const next = JSON.parse(JSON.stringify(prev)) as LearningProgress;
                    const cat = parsed.classification.category as keyof typeof next;
                    const subcat = parsed.classification.subcategory as string;
                    if (cat in next && subcat in next[cat]) {
                      const sub = next[cat][subcat];
                      sub.questionsAsked += 1;
                      if (parsed.classification.summary && !sub.summaryPoints.includes(parsed.classification.summary)) {
                        sub.summaryPoints.push(parsed.classification.summary);
                      }
                    }
                    return next;
                  });
                }
                continue;
              }
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) {
                assistantContent += chunk;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
                );
              }
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }

      if (ticker) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          const { data: prog } = await supabase
            .from('progress_state')
            .select('understanding, risks, valuation')
            .eq('user_id', sessionData.session.user.id)
            .eq('ticker', ticker)
            .single();
          if (prog) setProgress({
            understanding: prog.understanding ?? INITIAL_PROGRESS.understanding,
            risks: prog.risks ?? INITIAL_PROGRESS.risks,
            valuation: prog.valuation ?? INITIAL_PROGRESS.valuation,
          });
        }
      }
    } catch (error) {
      console.error('Advisor chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveThesis = async (thesis: ThesisChoice) => {
    setSavedThesis(thesis);
    if (!ticker) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) return;
    await supabase.from('active_saves').upsert(
      {
        user_id: session.session.user.id,
        ticker,
        thesis_stance: thesis.stance,
        custom_text: thesis.customText ?? null,
      },
      { onConflict: 'user_id,ticker' }
    );
  };

  const handleFollowUpClick = (action: any) => {
    switch (action.type) {
      case 'news':
        sendMessage(`Show me recent news for ${action.ticker}`);
        break;
      case 'compare':
        sendMessage(`Compare ${action.ticker} to its competitors`);
        break;
      case 'theme':
        sendMessage(`Tell me about the ${action.theme} investment theme`);
        break;
      case 'learn':
        sendMessage(`Explain ${action.topic} in simple terms`);
        break;
      case 'browse_themes':
        sendMessage('Show me investment themes to explore');
        break;
      case 'search':
        // Could open a search modal here
        break;
      case 'popular':
        sendMessage('What are some popular stocks right now?');
        break;
      case 'company':
        sendMessage(`Tell me about ${action.ticker}`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showChips = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] pb-16 md:flex-row">
      <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 py-4 px-4 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          {ticker && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary((s) => !s)}
              className="gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">{Math.round(overallProgress)}% Research</span>
            </Button>
          )}
          {ticker && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdvisorFocusedTicker(null)}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        <h2 className="font-semibold text-foreground">AI Advisor</h2>
        <p className="text-xs text-muted-foreground">
          {ticker ? `${companyName || ticker} (${ticker})` : 'Ask me anything about investing'}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? ''
                  : 'w-full max-w-none'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.id === 'welcome' && topPlaylists && topPlaylists.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {topPlaylists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handlePlaylistClick(playlist)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        {playlist.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up buttons (only for assistant messages with followUps) */}
              {message.role === 'assistant' && message.followUps && message.followUps.length > 0 && (
                <FollowUpButtons
                  options={message.followUps}
                  onSelect={handleFollowUpClick}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Starter chips or QuickPrompts */}
      {showChips && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {(suggestedQuestions.length > 0 ? suggestedQuestions : STARTER_CHIPS).map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
      {!showChips && suggestedQuestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ticker ? `Ask about ${companyName || ticker}...` : 'Ask me anything about investing...'}
            className="flex-1 rounded-full bg-background"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </div>

      {/* SummaryPanel + ThesisFlow — when ticker focused and progress >= 60% */}
      {ticker && showSummary && (
        <div className="hidden md:block w-80 border-l border-border flex-shrink-0">
          <SummaryPanel
            progress={progress}
            onAskAbout={(topic) => sendMessage(`Tell me about ${topic} for ${companyName || ticker}`)}
            onBuildThesis={() => setShowThesisBuilder(true)}
            companyName={companyName || ticker}
          />
        </div>
      )}

      {ticker && (
        <ThesisBuilder
          open={showThesisBuilder}
          onOpenChange={setShowThesisBuilder}
          companyName={companyName || ticker}
          ticker={ticker}
          progress={progress}
          onSaveThesis={handleSaveThesis}
        />
      )}
    </div>
  );
}
