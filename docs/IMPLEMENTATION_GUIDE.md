# Implementation Guide: Enhanced Advisor Chat

## Overview

Complete implementation of structured, conversation-driven advisor chat with:
- ✅ No RAG (Yahoo Finance + curated knowledge only)
- ✅ Structured response template
- ✅ 4 follow-up buttons after every response
- ✅ Conversation state tracking
- ✅ Guardrails for "should I buy" questions
- ✅ Breadcrumb navigation

---

## Quick Start

### 1. Deploy Backend Function

```bash
cd intel-tracks
supabase functions deploy advisor-chat-v3
```

**Test it:**
```bash
curl -X POST \
  https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "what does apple do"}],
    "ticker": "AAPL"
  }'
```

---

### 2. Update Frontend Component

**Example: Integrating into existing AdvisorScreen**

```tsx
// src/components/advisor/AdvisorScreen.tsx
import { useAdvisorChat } from '@/hooks/useAdvisorChat';
import { FollowUpButtons } from '@/components/advisor/FollowUpButtons';
import { Breadcrumbs } from '@/components/advisor/Breadcrumbs';

export function AdvisorScreen({ initialTicker }: { initialTicker?: string }) {
  const {
    messages,
    isLoading,
    conversationState,
    sendMessage,
    handleFollowUpAction,
    navigateToBreadcrumb,
  } = useAdvisorChat(initialTicker);

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumbs */}
      <Breadcrumbs
        path={conversationState.breadcrumbs}
        onNavigate={navigateToBreadcrumb}
      />

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <div key={index}>
            {/* Message Bubble */}
            <div className={`
              p-4 rounded-lg
              ${message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}
              max-w-[80%]
            `}>
              {message.content}
            </div>

            {/* Follow-up Buttons (only for assistant messages) */}
            {message.role === 'assistant' && message.followUps && (
              <FollowUpButtons
                options={message.followUps}
                onSelect={handleFollowUpAction}
                disabled={isLoading || index !== messages.length - 1}
              />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
          sendMessage(input.value, conversationState.lastTicker || undefined);
          input.value = '';
        }}>
          <input
            name="message"
            type="text"
            placeholder="Ask about a company or investment theme..."
            className="w-full px-4 py-2 border rounded-lg"
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}
```

---

## File Structure

```
supabase/functions/
  advisor-chat-v3/
    index.ts                 # Main backend function

src/
  components/advisor/
    AdvisorScreen.tsx        # Main chat UI (update this)
    FollowUpButtons.tsx      # ✅ New: 4-button follow-up grid
    Breadcrumbs.tsx          # ✅ New: Navigation breadcrumbs

  hooks/
    useAdvisorChat.ts        # ✅ New: Chat state + API integration

  data/
    stockKnowledge.ts        # Curated stock descriptions

  types/
    stockData.ts             # TypeScript interfaces

docs/
  CONVERSATION_FLOW.md       # Complete flow map
  STOCK_DATA_STRATEGY.md     # Data sourcing strategy
  IMPLEMENTATION_GUIDE.md    # This file
```

---

## Response Structure

### Backend Returns (SSE Stream)

**1. AI Response (streaming)**
```
data: {"choices":[{"delta":{"content":"**What Apple Does**\n"}}]}
data: {"choices":[{"delta":{"content":"Apple designs..."}}]}
...
```

**2. Follow-Up Options (at end of stream)**
```
data: {
  "type": "follow_ups",
  "options": [
    {
      "label": "See Apple's latest news",
      "action": { "type": "news", "ticker": "AAPL" }
    },
    ...
  ]
}
data: [DONE]
```

---

### Frontend Displays

**User sees:**
```
┌─────────────────────────────────────┐
│ Home › Technology › Apple           │  ← Breadcrumbs
├─────────────────────────────────────┤
│                                     │
│ You: what does apple do             │
│                                     │
│ AI: **What Apple Does**             │
│     Apple designs consumer          │
│     electronics (iPhone, Mac, iPad) │
│     and runs subscription services. │
│                                     │
│     **Why Investors Care**          │
│     Apple has 2B active devices...  │
│                                     │
│     **Quick Facts**                 │
│     - Market leader in premium...   │
│     - Services revenue grew 16%...  │
│                                     │
│     What would you like to explore? │
│                                     │
│     ┌───────────────┬─────────────┐ │
│     │ See Apple's   │ Compare to  │ │  ← 4 Follow-Up Buttons
│     │ latest news   │ competitors │ │
│     ├───────────────┼─────────────┤ │
│     │ View Tech     │ Learn stock │ │
│     │ theme         │ basics      │ │
│     └───────────────┴─────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [Ask about a company...]            │  ← Input
└─────────────────────────────────────┘
```

---

## Testing Checklist

### Backend Tests

```bash
# Test 1: Company overview
curl -X POST https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what does netflix do"}],"ticker":"NFLX"}'

# Expected: Structured response with 4 follow-ups

# Test 2: "Should I buy" guardrail
curl -X POST https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"should i buy apple"}],"ticker":"AAPL"}'

# Expected: Non-streaming disclaimer + follow-ups

# Test 3: Off-topic
curl -X POST https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"whats your favorite color"}]}'

# Expected: Redirect to investing topics

# Test 4: Invalid ticker
curl -X POST https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"tell me about APPEL"}],"ticker":"APPEL"}'

# Expected: "Couldn't find APPEL. Did you mean AAPL?"
```

---

### Frontend Tests

- [ ] Message bubbles display correctly
- [ ] Follow-up buttons appear after AI response
- [ ] Clicking follow-up sends appropriate message
- [ ] Breadcrumbs update when viewing stock/theme
- [ ] Clicking breadcrumb navigates back
- [ ] Loading state shows while AI is thinking
- [ ] Only latest follow-ups are clickable (earlier ones disabled)
- [ ] Mobile: 2-column grid works on small screens
- [ ] Typing indicator shows during streaming
- [ ] Off-topic redirect works

---

## Environment Variables

Make sure these are set in Supabase:

```bash
# In Supabase Dashboard → Edge Functions → Secrets
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://joafocyskbvvfltwfefu.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Migration from Old advisor-chat

### Option A: Parallel Deployment (Recommended)

1. Deploy `advisor-chat-v3` alongside existing `advisor-chat`
2. Update frontend to call `/advisor-chat-v3`
3. Monitor for issues
4. After 1 week, deprecate old function

### Option B: Direct Replacement

1. Rename existing `advisor-chat` to `advisor-chat-old`
2. Deploy `advisor-chat-v3` as `advisor-chat`
3. Update frontend (no URL change needed)

---

## Adding New Stocks

**1. Add to curated knowledge**

```typescript
// supabase/functions/advisor-chat-v3/index.ts
const STOCK_KNOWLEDGE: Record<string, any> = {
  // ... existing stocks
  TSLA: {
    name: "Tesla",
    description: "Tesla makes electric vehicles and energy storage products...",
    whyInvestorsCare: "Tesla is the EV market leader...",
    keyFacts: [
      "Sells 1.8M vehicles annually",
      "Expanding into robotics (Optimus)",
      "CEO Elon Musk is polarizing"
    ],
    themes: ["space", "nuclear"], // If relevant
  },
};
```

**2. Redeploy function**

```bash
supabase functions deploy advisor-chat-v3
```

**3. Test**

```bash
curl -X POST https://joafocyskbvvfltwfefu.supabase.co/functions/v1/advisor-chat-v3 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what does tesla do"}],"ticker":"TSLA"}'
```

---

## Common Issues

### Issue 1: Follow-ups not appearing

**Symptom:** AI response completes but no buttons show

**Fix:** Check SSE parsing in frontend
```tsx
if (parsed.type === 'follow_ups') {
  // Make sure this code runs
  console.log('Follow-ups received:', parsed.options);
  assistantMessage.followUps = parsed.options;
}
```

---

### Issue 2: "Should I buy" not triggering

**Symptom:** AI gives stock advice instead of disclaimer

**Fix:** Check `detectIntent` function catches variations
```typescript
// Add more patterns to detectIntent()
if (
  lower.includes("should i buy") ||
  lower.includes("good investment") ||
  lower.includes("worth it")
) {
  return { type: "should_buy", shouldBuyDetected: true };
}
```

---

### Issue 3: Breadcrumbs not updating

**Symptom:** Breadcrumb stuck on "Home"

**Fix:** Ensure `setConversationState` is called
```tsx
if (ticker) {
  setConversationState((prev) => ({
    ...prev,
    lastTicker: ticker,
    breadcrumbs: [...prev.breadcrumbs, ticker],
  }));
}
```

---

## Performance Optimization

### Backend
- **Cache Yahoo Finance responses**: 5-minute TTL for price data
- **Batch fetch**: If user asks about multiple stocks, fetch in parallel
- **Rate limiting**: Max 60 requests/minute per user

### Frontend
- **Debounce input**: Wait 300ms after user stops typing
- **Virtual scrolling**: For long chat histories (>50 messages)
- **Lazy load**: Don't render off-screen messages

---

## Analytics to Track

```typescript
// Track these events in your analytics (Mixpanel, Amplitude, etc.)
{
  event: "advisor_message_sent",
  properties: {
    ticker: "AAPL",
    intent: "general_company",
    hasFollowUps: true,
  }
}

{
  event: "advisor_followup_clicked",
  properties: {
    ticker: "AAPL",
    action_type: "news",
    position: 1, // Which button (1-4)
  }
}

{
  event: "advisor_breadcrumb_clicked",
  properties: {
    from_level: 3,
    to_level: 1,
  }
}
```

---

## Future Enhancements

### Phase 2: Smart Suggestions
- After 3 questions about Apple, suggest: "Want to compare Apple to Microsoft?"
- Track which concepts user has learned
- Progressively introduce advanced topics

### Phase 3: Personalization
- Remember user's quiz results (risk tolerance)
- Suggest themes based on preferences
- "You prefer stable stocks. Here are 3 dividend aristocrats..."

### Phase 4: Multi-Stock Comparison
- User: "compare apple microsoft google"
- AI: Returns structured table + insights
- Follow-ups: Deep-dive into any one, or view theme

---

**Last Updated**: 2024-02-13
**Owner**: Engineering Team
**Questions**: Post in #engineering Slack
