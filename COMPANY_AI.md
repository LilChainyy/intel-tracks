# Company-Specific AI Advisor – Architecture & Logic

This document describes how the company-specific AI advisor works: the backend logic, data flow, and frontend structure.

---

## Overview

The company advisor is embedded on each company profile page. It helps users research a stock through structured Q&A, tracks learning progress across three categories (understanding, risks, valuation), and leads to building an investment thesis.

---

## 1. Backend: `advisor-chat` (Groq Llama)

**File:** `supabase/functions/advisor-chat/index.ts`

**Purpose:** Answers company-specific questions in simple, teen-friendly language.

**Inputs:**
- `messages` – Chat history (last 6 messages)
- `ticker` – Stock symbol (e.g. AAPL)
- `companyName` – Display name
- `progress` (optional) – Current learning state

**Flow:**
1. Validates ticker (1–10 alphanumeric chars)
2. Fetches stock data from **Yahoo Finance** (no API key needed):
   - Price, market cap, P/E, profit margin, revenue/earnings growth, sector, industry
   - Endpoint: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=financialData,defaultKeyStatistics,price`
3. Builds system prompt:
   - “Explain like to a 15-year-old”
   - 2–3 sentences max, no markdown, plain language
   - Jargon replacements (e.g. “fundamentals” → “how the business is doing”)
   - Injects Yahoo Finance data as context
4. Calls **Groq Llama** (`llama-3.1-8b-instant`), max 150 tokens
5. Streams response (Groq uses OpenAI-compatible SSE format natively)

**Data source:** Yahoo Finance only. No Finnhub, no Supabase DB for this function.

---

## 2. Learning Analysis (built into advisor-chat)

**Note:** Previously a separate Edge Function; now integrated into `advisor-chat` as a second Groq call after streaming.

**Purpose:** Classifies what the user learned and suggests follow-up questions.

**Inputs:**
- `userQuestion` – User’s question
- `aiResponse` – AI’s reply
- `ticker`, `companyName`
- `currentProgress` – Current learning state

**Flow:**
1. **Progress analysis** – Calls Groq to classify the Q&A into:
   - **Category:** `understanding` | `risks` | `valuation`
   - **Subcategory:** e.g. `company_fundamental`, `financial_health`, `industry_context`, `company_risks`, `external_risks`, `investment_risks`, `current_price`, `company_valuation`, `expected_returns`
   - **Summary:** One sentence of what they learned
2. **Follow-up questions** – Generates 3 short questions:
   - Uses covered vs uncovered topics
   - Prefers uncovered
   - Max 3–4 words each, casual tone
   - Examples: “Worth buying? 💰”, “Any red flags?”, “How’s the CEO?”
3. Returns `{ progressUpdate, suggestedQuestions }`

---

## 3. Frontend: Progress Structure

**File:** `src/components/stock/advisor/types.ts`

**Learning model:**
- 3 main categories: `understanding`, `risks`, `valuation`
- Each category has 3 subsections
- Each subsection: `{ questionsAsked: number, summaryPoints: string[] }`

| Category      | Subcategories                              |
|---------------|---------------------------------------------|
| understanding | company_fundamental, financial_health, industry_context |
| risks         | company_risks, external_risks, investment_risks       |
| valuation     | current_price, company_valuation, expected_returns      |

**Progress calculation:**
- Subsection: `min(questionsAsked / 5, 1) * 100`
- Section: average of subsections
- Overall: average of the 3 category progress values

---

## 4. Frontend: Chat Flow

**File:** `src/components/advisor/AdvisorScreen.tsx`

**Main loop:**
1. User sends a message (or clicks a suggestion chip)
2. Frontend calls `advisor-chat` with messages + `ticker` + `companyName`
3. Streams assistant response into the chat UI
4. After streaming, advisor-chat returns `advisor_metadata` SSE event with classification + suggested questions
5. Updates progress from classification
6. Updates suggested questions from metadata

**Research questions:** 15 predefined questions (5 per category):
- **Understanding:** “What does this company do?”, “How does it make money?”, “Who are its main customers?”, “What’s its competitive advantage?”, “How’s the industry doing?”
- **Risks:** “What are the biggest risks?”, “Could competition hurt them?”, “Any regulatory concerns?”, “What if the economy slows?”, “Is management trustworthy?”
- **Valuation:** “Is the price fair?”, “How does it compare to competitors?”, “What’s the growth potential?”, “Are there better alternatives?”, “What’s a fair price target?”

Clicking a question sends it to the chat and advances the index for that category.

---

## 5. Summary Panel & Thesis Builder

The company AI advisor and Thesis Builder are tightly coupled: progress from the chat unlocks the Thesis Builder. **When migrating to the global AI advisor, these should move together** as one unit (chat flow + SummaryPanel + ThesisBuilder).

### When Thesis Builder Unlocks

**File:** `src/components/stock/advisor/SummaryPanel.tsx` (lines 24–25)

```typescript
const overallProgress = calculateOverallProgress(progress);
const showThesisButton = overallProgress >= 60;
```

- **Threshold:** Overall progress ≥ **60%** 
- **Overall progress** = average of the 3 category progress values (understanding, risks, valuation)
- Each category reaches 100% when ~5 questions have been asked in that category
- So roughly ~3 questions per category unlocks the Thesis Builder

### SummaryPanel Logic

- Shows overall progress bar and per-category progress
- "Ask about this" links for subsections without content
- When `overallProgress >= 60`:
  - Message: "You've learned enough! Ready to build your thesis."
  - Button: "Build Your Thesis"
  - Clicking calls `onBuildThesis` → opens ThesisBuilder dialog

### ThesisBuilder Logic

**File:** `src/components/stock/advisor/ThesisBuilder.tsx`

1. **Summary section** – Displays learning points from each category (up to last 3 per section). If empty: "Keep exploring to learn more."
2. **Stance selection** – User picks one:
   - **Bullish** – "I want to invest"
   - **Neutral** – "Watchlist only"
   - **Bearish** – "Not for me"
   - **Custom** – Free-text textarea for user-written thesis
3. **Actions:**
   - "Keep Exploring" – Closes dialog without saving
   - "Save Thesis" – Saves stance (and custom text if Custom) via `onSaveThesis`, then closes
4. **Persistence:** Thesis is stored in component state only—**not persisted to the backend**.

---

## Data Flow Diagram

```
User question / research question click
         │
         ▼
┌─────────────────────────────┐
│  advisor-chat               │
│  - Yahoo Finance (context)  │
│  - Groq Llama (response)    │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  (built into advisor-chat)  │
│  - Progress classification  │
│  - Follow-up suggestions    │
└─────────────────────────────┘
         │
         ▼
  Update progress & suggested questions
         │
         ▼
  (Optional) ThesisBuilder when progress ≥ 60%
```

---

## Key Files

| File | Purpose |
|------|---------|
| `supabase/functions/advisor-chat/index.ts` | Company Q&A via Groq + Yahoo Finance + learning analysis |
| `src/components/advisor/AdvisorScreen.tsx` | Main chat UI and flow |
| `src/components/stock/advisor/SummaryPanel.tsx` | Progress UI |
| `src/components/stock/advisor/ThesisBuilder.tsx` | Thesis selection UI |
| `src/components/stock/advisor/types.ts` | Progress types and helpers |
| `src/components/company/CompanyProfileScreen.tsx` | Embeds AIAdvisorChat |

---

## Migration Note

The company AI advisor (chat + SummaryPanel + ThesisBuilder) forms one cohesive flow. When migrating to the global AI advisor, keep them together: the research questions, progress tracking, `analyze-learning` integration, 60% unlock threshold, SummaryPanel, and ThesisBuilder should all move as a unit.
