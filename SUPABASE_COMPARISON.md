# Supabase Project Comparison

## Old Project (Lovable): `emscbdwqqnvcjskrdmzp`
## New Project (adamsmyth): `joafocyskbvvfltwfefu`

---

## 📊 DATABASE TABLES

### Old Project (emscbdwqqnvcjskrdmzp) - Likely Has:

1. **stock_quotes** ✅
   - Stores daily stock price data
   - Columns: ticker, current_price, ytd_change, is_positive, last_updated

2. **user_stock_theories** ✅
   - User-generated stock investment theories
   - Columns: user_id, ticker, theory, confidence, evidence, etc.

3. **user_research_xp** ✅
   - User XP and progress tracking
   - Columns: user_id, total_xp, questions_asked, research_time_minutes, level

4. **quiz_responses** ✅
   - User quiz answers
   - Columns: user_id, question_id, response, etc.

5. **archetype_stats** ✅
   - Investor archetype statistics
   - Columns: archetype_id, count, percentage

6. **referral_codes** ✅
   - Referral code system
   - Columns: code, uses, max_uses, etc.

7. **user_nudges** (possibly)
   - User notification nudges

8. **macro_events** (possibly)
   - Macro economic events

### New Project (joafocyskbvvfltwfefu) - Currently Has:

1. **catalysts** ✅ (just created)
   - Stock market catalysts from API
   - Columns: id, title, description, category, time, icon, companies, theme_id, impact, source_url

---

## ⚙️ EDGE FUNCTIONS

### Old Project (emscbdwqqnvcjskrdmzp) - Likely Has:

1. **fetch-stock-data** ✅
   - Fetches stock quotes from Alpha Vantage

2. **refresh-stock-data** ✅
   - Refreshes YTD stock data

3. **stock-chart** ✅
   - Gets stock chart data

4. **stock-analysis** ✅
   - Analyzes stock data

5. **ai-advisor-chat** ✅
   - AI chat for stock advice

6. **company-advisor-chat** ✅
   - Company-specific advisor chat

7. **analyze-learning** ✅
   - Analyzes user learning progress

### New Project (joafocyskbvvfltwfefu) - Currently Has:

1. **fetch-catalysts** ✅ (just created)
   - Fetches catalysts from Finnhub API

---

## 🔍 HOW TO CHECK WHAT'S ACTUALLY IN EACH PROJECT

### Check Old Project:
1. Go to: https://supabase.com/dashboard/project/emscbdwqqnvcjskrdmzp
2. Check:
   - **Table Editor**: See all tables
   - **Edge Functions**: See all functions
   - **SQL Editor**: Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

### Check New Project:
1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu
2. Check:
   - **Table Editor**: See all tables
   - **Edge Functions**: See all functions
   - **SQL Editor**: Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

---

## 📋 MIGRATION FILES IN CODEBASE

These migrations exist in your codebase (need to be run on new project if you want that data):

1. `20251217035005_...` - stock_quotes table
2. `20260105084126_...` - user_stock_theories, user_research_xp
3. `20260116232543_...` - quiz_responses, archetype_stats
4. `20260117043621_...` - user_nudges policies
5. `20260121040144_...` - referral_codes
6. `20260121040311_...` - (check file)
7. `20260121040417_...` - referral code policies
8. `20260121040446_...` - referral code function
9. `20260122000000_...` - catalysts table ✅ (already run on new project)

---

## 🎯 RECOMMENDATION

**Option 1: Use New Project Only (Recommended)**
- Run all migrations on new project
- Deploy all Edge Functions to new project
- Migrate any user data if needed

**Option 2: Keep Both Projects**
- Old project: User data, stock quotes, theories
- New project: Catalysts only
- App connects to both (complex)

**Option 3: Migrate Everything to New Project**
- Copy all data from old to new
- Run all migrations on new
- Deploy all functions to new
- Switch app to use new project only

---

## 📝 HOW TO CHECK WHAT'S ACTUALLY THERE

### Quick Check Script

1. **For Old Project** (`emscbdwqqnvcjskrdmzp`):
   - Go to: https://supabase.com/dashboard/project/emscbdwqqnvcjskrdmzp/sql/new
   - Copy and run the SQL from `check-supabase-projects.sql`

2. **For New Project** (`joafocyskbvvfltwfefu`):
   - Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/sql/new
   - Copy and run the same SQL

3. **Check Edge Functions**:
   - Old: https://supabase.com/dashboard/project/emscbdwqqnvcjskrdmzp/functions
   - New: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions

---

## 📦 WHAT TO MIGRATE TO NEW PROJECT

If you want everything in the new project, you need to:

1. **Run All Migrations** (in order):
   - `20251217035005_...` - stock_quotes
   - `20260105084126_...` - user_stock_theories, user_research_xp
   - `20260116232543_...` - quiz_responses, archetype_stats
   - `20260117043621_...` - user_nudges policies
   - `20260121040144_...` - referral_codes
   - `20260121040311_...` - referral function
   - `20260121040417_...` - referral policies
   - `20260121040446_...` - referral grants
   - `20260122000000_...` - catalysts ✅ (already done)

2. **Deploy All Edge Functions**:
   - fetch-stock-data
   - refresh-stock-data
   - stock-chart
   - stock-analysis
   - ai-advisor-chat
   - company-advisor-chat
   - analyze-learning
   - fetch-catalysts ✅ (already done)

3. **Set Up Secrets**:
   - FINNHUB_API_KEY ✅ (already done)
   - ALPHA_VANTAGE_API_KEY (if used)
   - LOVABLE_API_KEY (if used)
