import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvestorQuiz } from '@/context/InvestorQuizContext';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { calculateMatchScore } from '@/utils/matchScore';
import { convertToUserProfile } from '@/utils/investorScoring';
import type { Playlist } from '@/types/playlist';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

const ADVISOR_SYSTEM_PROMPT = `You are a knowledgeable investment advisor built into the Adamsmyth app. Users come to you to learn about companies, industries, and investment opportunities. Give substantive, helpful answers in accessible language — avoid heavy jargon, but don't oversimplify. Be concise but thorough: 3-5 sentences per response. You can reference specific ticker symbols when relevant. Be honest about uncertainty and remind users that this is not financial advice when appropriate.`;

export function AdvisorScreen() {
  const { state } = useInvestorQuiz();
  const { setSelectedPlaylist, setCurrentScreen, setActiveTab } = useApp();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [topPlaylists, setTopPlaylists] = useState<Playlist[] | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('company-list');
    setActiveTab('theme');
  };

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

    try {
      // Build the full message history (excluding the welcome message for the API)
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt: ADVISOR_SYSTEM_PROMPT,
            maxTokens: 600,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error('An error occurred. Please try again.');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ]);

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
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) {
                assistantContent += chunk;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                );
              }
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showChips = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] pb-16">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 py-4 px-4 border-b border-border bg-muted/30">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">AI Advisor</h2>
        <p className="text-xs text-muted-foreground">Ask me anything about investing</p>
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
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
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

      {/* Starter chips — only shown before the first user message */}
      {showChips && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {STARTER_CHIPS.map((chip) => (
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

      {/* Input area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about investing..."
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
  );
}
