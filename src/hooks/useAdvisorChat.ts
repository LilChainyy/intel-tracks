// Hook for managing advisor chat with follow-ups and conversation state

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FollowUpOption, FollowUpAction } from '@/components/advisor/FollowUpButtons';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  followUps?: FollowUpOption[];
  timestamp: Date;
}

export interface ConversationState {
  lastTicker: string | null;
  lastTheme: string | null;
  breadcrumbs: string[];
}

export function useAdvisorChat(initialTicker?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    lastTicker: initialTicker || null,
    lastTheme: null,
    breadcrumbs: ['Home'],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Send a message to the advisor
  const sendMessage = useCallback(async (content: string, ticker?: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Update conversation state
    if (ticker) {
      setConversationState((prev) => ({
        ...prev,
        lastTicker: ticker,
        breadcrumbs: [...prev.breadcrumbs.filter((b) => b !== ticker), ticker],
      }));
    }

    try {
      // Abort previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Call advisor-chat function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-chat-v3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: messages.concat(userMessage),
            ticker: ticker || conversationState.lastTicker,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add assistant message placeholder
      setMessages((prev) => [...prev, assistantMessage]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);

            // Check if it's follow-up options
            if (parsed.type === 'follow_ups') {
              assistantMessage.followUps = parsed.options;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...assistantMessage };
                return newMessages;
              });
              continue;
            }

            // Regular streaming content
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage.content += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...assistantMessage };
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }

      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble right now. Can you try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, conversationState]);

  // Handle follow-up action clicks
  const handleFollowUpAction = useCallback((action: FollowUpAction) => {
    switch (action.type) {
      case 'news':
        sendMessage(`Show me recent news for ${action.ticker}`, action.ticker);
        break;

      case 'compare':
        sendMessage(`Compare ${action.ticker} to its competitors`, action.ticker);
        break;

      case 'theme':
        setConversationState((prev) => ({
          ...prev,
          lastTheme: action.theme || null,
          breadcrumbs: [...prev.breadcrumbs, action.theme || 'Theme'],
        }));
        sendMessage(`Tell me about the ${action.theme} investment theme`);
        break;

      case 'learn':
        sendMessage(`Explain ${action.topic} in simple terms`);
        break;

      case 'browse_themes':
        sendMessage('Show me investment themes to explore');
        break;

      case 'search':
        // This should open a search modal (handled by parent component)
        break;

      case 'popular':
        sendMessage('What are some popular stocks right now?');
        break;

      case 'company':
        sendMessage(`Tell me about ${action.ticker}`, action.ticker);
        break;
    }
  }, [sendMessage]);

  // Navigate breadcrumbs
  const navigateToBreadcrumb = useCallback((level: number) => {
    const newBreadcrumbs = conversationState.breadcrumbs.slice(0, level + 1);
    setConversationState((prev) => ({
      ...prev,
      breadcrumbs: newBreadcrumbs,
    }));

    const target = newBreadcrumbs[newBreadcrumbs.length - 1];
    if (target === 'Home') {
      sendMessage('Show me what I can explore');
    } else {
      sendMessage(`Tell me about ${target}`);
    }
  }, [conversationState.breadcrumbs, sendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationState({
      lastTicker: null,
      lastTheme: null,
      breadcrumbs: ['Home'],
    });
  }, []);

  return {
    messages,
    isLoading,
    conversationState,
    sendMessage,
    handleFollowUpAction,
    navigateToBreadcrumb,
    clearChat,
  };
}
