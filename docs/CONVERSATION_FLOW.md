# Conversation Flow Map

## Overview

Every AI response has **4 clickable follow-up options**. No dead ends. User always knows where to go next.

---

## Core Principle: **"Always Have Next Step"**

```
User Input → AI Response → Follow-Up Options (4 buttons)
                              ↓
              User clicks option → New Context → AI Response → Follow-Up Options (4 buttons)
                                                                  ↓
                                                              [continues...]
```

---

## Flow Map

### **Entry Point: User asks about a company**

**User:** "what does apple do"

**AI Response Structure:**
```
**What Apple Does**
[2 sentences]

**Why Investors Care**
[1-2 sentences]

**Quick Facts**
- [Fact 1]
- [Fact 2]
- [Fact 3]

What would you like to explore next?
```

**Follow-Up Options (4 buttons):**
1. **"See Apple's latest news"** → News view
2. **"Compare Apple to peers"** → Comparison flow
3. **"View Technology theme stocks"** → Theme list
4. **"Learn investing basics"** → Educational content

---

### **Path 1: News**

**User clicks:** "See Apple's latest news"

**AI Response:**
```
Here's what's happening with Apple recently:

• [News headline 1] - [Source], [Date]
• [News headline 2] - [Source], [Date]
• [News headline 3] - [Source], [Date]

These are from the last 30 days. Want to dive deeper?
```

**Follow-Up Options:**
1. **"How does this affect Apple's stock?"** → Analysis
2. **"Compare Apple to Microsoft"** → Comparison
3. **"Back to Apple overview"** → Company info
4. **"Browse Technology theme"** → Theme list

---

### **Path 2: Comparison**

**User clicks:** "Compare Apple to peers"

**AI Response:**
```
**Apple vs. Microsoft vs. Google**

All three dominate tech but in different ways:
- **Apple**: Hardware + services ecosystem ($2.8T market cap)
- **Microsoft**: Cloud computing + enterprise software ($3.1T)
- **Google**: Search advertising + AI infrastructure ($2.2T)

Apple has the highest profit margins. Microsoft has the most predictable revenue. Google is betting big on AI.

Want to explore one of these deeper?
```

**Follow-Up Options:**
1. **"Tell me more about Microsoft"** → Microsoft overview
2. **"What's a profit margin?"** → Learn topic
3. **"See all Technology stocks"** → Theme list
4. **"Back to Apple"** → Company info

---

### **Path 3: Theme View**

**User clicks:** "View Technology theme stocks"

**AI Response:**
```
**Technology Theme**
Big tech companies that shape how we work, communicate, and consume media. These tend to grow fast but can be volatile.

**Top Stocks in This Theme:**
• Apple (AAPL) - Consumer electronics leader
• Microsoft (MSFT) - Cloud and software giant
• Nvidia (NVDA) - AI chip maker

This theme fits investors who are comfortable with price swings but want long-term growth.

Which stock interests you?
```

**Follow-Up Options:**
1. **"Learn about Nvidia"** → Company info
2. **"Compare all three"** → Comparison
3. **"Browse other themes"** → All themes
4. **"What does 'volatile' mean?"** → Learn topic

---

### **Path 4: Educational**

**User clicks:** "Learn investing basics"

**AI Response:**
```
**Investing 101: Stock Basics**

When you buy a stock, you own a tiny piece of that company. If the company does well, your stock can go up in value. If it struggles, it can go down.

**Key Terms:**
- **Market cap**: Total value of all shares (bigger = more established)
- **Dividend**: Cash the company pays you just for owning the stock
- **Volatility**: How much the price bounces around

Want to apply this to a real company?
```

**Follow-Up Options:**
1. **"Show me a stable stock (low volatility)"** → Cash Cows theme
2. **"Show me a growth stock (high volatility)"** → Space/Nuclear themes
3. **"Learn more terms"** → Glossary
4. **"Browse all themes"** → Theme list

---

## Special Flows

### **Flow A: "Should I Buy?" (Guardrail)**

**User:** "should i buy apple"

**AI Response (Non-streaming, immediate):**
```
I can't tell you what to buy — that's a decision only you can make after doing your research. But I can help you understand the company, the risks, and what to look for.

Want to learn about Apple's business or recent performance?
```

**Follow-Up Options:**
1. **"Tell me about Apple's business"** → Company overview
2. **"What are the risks?"** → Risk analysis
3. **"How do I evaluate stocks?"** → Learn valuation
4. **"Show me stable alternatives"** → Cash Cows theme

---

### **Flow B: Off-Topic Question**

**User:** "what's your favorite color"

**AI Response:**
```
I'm here to help you learn about investing and stocks! I can explain companies, compare themes, or answer questions about how the stock market works.

What would you like to explore?
```

**Follow-Up Options:**
1. **"Browse investment themes"** → Theme list
2. **"Search for a company"** → Search modal
3. **"Learn stock basics"** → Education
4. **"Show popular stocks"** → Trending/popular

---

### **Flow C: Invalid Ticker**

**User:** "tell me about appel"

**AI Response:**
```
I couldn't find a company with ticker "APPEL". Did you mean **AAPL** (Apple)?

If not, try searching by company name or browse themes to discover stocks.
```

**Follow-Up Options:**
1. **"Yes, show me Apple (AAPL)"** → Company info
2. **"Search by company name"** → Search modal
3. **"Browse themes"** → Theme list
4. **"Popular stocks right now"** → Trending

---

## Context Tracking

### **Session State**
```typescript
interface ConversationState {
  lastTicker: string | null;        // "AAPL"
  lastTheme: string | null;          // "nuclear"
  questionsAsked: number;            // Track engagement
  hasSeenDisclaimer: boolean;        // Show "not financial advice" once
  breadcrumbs: string[];             // ["Themes", "Technology", "Apple"]
}
```

### **Breadcrumb Navigation**

Always show where the user is:
```
Home > Themes > Technology > Apple
```

Each level is clickable to go back up.

---

## Intent Detection

The AI detects user intent to provide relevant follow-ups:

| User Message | Intent | Follow-Ups Shown |
|--------------|--------|------------------|
| "what does apple do" | general_company | News, Compare, Theme, Learn |
| "apple news" | news | Analysis, Compare, Overview, Theme |
| "should i buy apple" | should_buy | Business, Risks, Evaluation, Alternatives |
| "apple vs microsoft" | compare | Deep-dive either, Theme, Learn margins |
| "what's a P/E ratio" | learn | Examples, Related concepts, Back to stock |
| "nuclear energy stocks" | theme | Top stocks, Why theme, Compare themes |

---

## Implementation Guide

### **Backend (Supabase Function)**

`advisor-chat-v3` already implements:
- ✅ Structured response template
- ✅ Follow-up option generator (`generateFollowUpOptions`)
- ✅ Intent detection (`detectIntent`)
- ✅ Guardrails for "should I buy" questions
- ✅ Context building from curated knowledge

**Response Format:**
```json
{
  "response": "AI answer here...",
  "followUps": [
    {
      "label": "See Apple's latest news",
      "action": {
        "type": "news",
        "ticker": "AAPL"
      }
    },
    ...
  ]
}
```

---

### **Frontend (React Component)**

**1. Display Follow-Up Buttons**

```tsx
// components/advisor/FollowUpButtons.tsx
interface FollowUpOption {
  label: string;
  action: {
    type: string;
    ticker?: string;
    theme?: string;
    topic?: string;
  };
}

export function FollowUpButtons({ options, onSelect }: {
  options: FollowUpOption[];
  onSelect: (action: any) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(opt.action)}
          className="px-4 py-3 border rounded-lg text-left hover:bg-gray-50"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

**2. Handle Follow-Up Actions**

```tsx
// components/advisor/AdvisorChat.tsx
function handleFollowUpClick(action: any) {
  switch (action.type) {
    case 'news':
      // Send message: "Show me news for [ticker]"
      sendMessage(`Show me news for ${action.ticker}`, action.ticker);
      break;

    case 'compare':
      // Navigate to comparison view or send message
      sendMessage(`Compare ${action.ticker} to its competitors`, action.ticker);
      break;

    case 'theme':
      // Navigate to theme list
      router.push(`/themes/${action.theme}`);
      break;

    case 'learn':
      // Send educational question
      sendMessage(`What is ${action.topic}?`);
      break;

    case 'browse_themes':
      router.push('/themes');
      break;

    case 'search':
      // Open search modal
      setSearchModalOpen(true);
      break;
  }
}
```

**3. Parse Streaming Response**

```tsx
const [followUps, setFollowUps] = useState<FollowUpOption[]>([]);

// In SSE handler
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'follow_ups') {
    // Follow-ups arrived after AI response
    setFollowUps(data.options);
  } else if (data.choices) {
    // Regular streaming content
    const content = data.choices[0]?.delta?.content;
    if (content) appendToMessage(content);
  }
};
```

---

### **Breadcrumb Navigation**

```tsx
// components/navigation/Breadcrumbs.tsx
export function Breadcrumbs({ path }: { path: string[] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {path.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span>›</span>}
          <button
            onClick={() => navigateToLevel(i)}
            className="hover:text-blue-600"
          >
            {item}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Test all 4 follow-up paths from company overview
- [ ] Test "should I buy" guardrail
- [ ] Test off-topic redirect
- [ ] Test invalid ticker handling
- [ ] Verify follow-ups update based on intent
- [ ] Verify breadcrumbs work at every level
- [ ] Test back navigation (doesn't break context)
- [ ] Verify mobile layout for 4-button grid

---

## Future Enhancements

### Phase 2: Smarter Context
- Remember last 3 tickers discussed
- Suggest comparisons based on viewed stocks
- "You looked at Apple and Microsoft. Want to compare them?"

### Phase 3: Learning Progress
- Track which concepts user has learned
- Gradually introduce advanced topics
- "You've learned about market cap and P/E. Ready for EPS?"

### Phase 4: Personalization
- Remember user's risk tolerance (from quiz)
- Suggest themes based on preferences
- "You prefer safe investments. Here are 3 dividend stocks..."

---

**Last Updated**: 2024-02-13
**Owner**: Product Team
