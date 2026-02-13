# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Directory

**IMPORTANT:** The actual codebase is located in the `intel-tracks/` subdirectory. When running commands or referencing files, work from `/Users/xinyucui/Adamsmyth/code/intel-tracks/`.

## Project Overview

Adamsmyth is a fintech web application for discovering investment themes and stock opportunities. It functions as "Spotify playlists for stocks" - matching users with investment themes based on their risk tolerance, sector preferences, and time horizons.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite (SWC)
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI components)
- **State:** React Context (AppContext, AuthContext, QuizContext, StockDataContext)
- **Data Fetching:** TanStack React Query
- **Routing:** React Router DOM 7
- **Backend:** Supabase (PostgreSQL + Deno Edge Functions)
- **Deployment:** Vercel

## Common Commands

**Note:** All commands should be run from the `intel-tracks/` directory.

```bash
npm run dev         # Start dev server on http://localhost:8080
npm run build       # Production build to dist/
npm run build:dev   # Development build with dev mode
npm run lint        # Run ESLint
npm run preview     # Preview production build locally
```

## Architecture

### Directory Structure

- `src/pages/` - Route-level page components
- `src/components/` - Reusable components organized by feature (quiz/, advisor/, stock/, phase2/, etc.)
- `src/components/ui/` - shadcn/ui base components
- `src/context/` - React Context providers for global state
- `src/hooks/` - Custom React hooks (useCatalysts, useStockData, useStockChart)
- `src/data/` - Static data (playlists, quiz questions, catalysts fallback)
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions (matchScore, investorScoring)
- `src/integrations/supabase/` - Supabase client and auto-generated types
- `supabase/functions/` - Deno Edge Functions (advisor-chat, fetch-catalysts, stock-chart, etc.)
- `supabase/migrations/` - PostgreSQL migration files

### Key Patterns

**State Management:** Five React Contexts handle different domains:
- `AppContext` - Navigation state, active tab/screen, watchlist, saved stocks, selected playlists/stocks/catalysts
- `AuthContext` - User authentication and session management via Supabase
- `QuizContext` - Original quiz flow state
- `InvestorQuizContext` - Investor profile quiz flow
- `StockDataContext` - Stock data caching and fetching coordination

**Matching Algorithm** (`src/utils/matchScore.ts`):
- Weights: Risk 45%, Sectors 35%, Timeline 20%
- Distance-based scoring for risk profile alignment with playlists
- Returns 0-100 score; thresholds: ≥75 = great match, ≥50 = good match

**Authentication:** Supabase Auth with JWT tokens. All routes except `/` require authentication via `ProtectedRoute` wrapper component.

**Data Fallback:** Catalyst data falls back to hardcoded data in `src/data/catalysts.ts` when database is unavailable.

**Path Alias:** `@/` is aliased to `src/` in vite.config.ts for cleaner imports.

### Entry Points

- `src/main.tsx` - React root mount point
- `src/App.tsx` - Route configuration and context provider wrappers (QueryClient, Auth, StockData, Quiz contexts)
- `index.html` - HTML entry with Vite HMR script

### Routing

React Router DOM 7 configuration in `App.tsx`:
- `/` - LandingPage (public, signup flow)
- `/home` - HomePage (protected, main app entry)
- `/stocks/*` - StocksApp nested routes (protected)
- `/stocks/news` - NewsPage (protected)
- `/saved` - SavedPage (protected)
- `/:category/*` - EmptyCategory placeholder (protected)
- `*` - NotFound (404)

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase-anon-key>
```

## Database

**Supabase Project:** `joafocyskbvvfltwfefu`

Key tables with Row Level Security (RLS) enabled:
- `user_profiles` - User data with referral tracking
- `catalysts` - Market catalyst events (public read access)

**Edge Functions** (Deno runtime, powered by Groq Llama):
- `advisor-chat` - AI chat for investment advice (streaming + learning analysis)
- `fetch-catalysts` - Retrieve market catalyst data
- `fetch-stock-data` - Pull stock information
- `refresh-stock-data` - Update cached stock data
- `stock-analysis` - Analyze stock fundamentals
- `stock-chart` - Generate stock chart data
- `index-playlists` - Index playlists to Pinecone for RAG
- `index-documents` - Index documents to Pinecone for RAG

Note: Most edge functions have `verify_jwt = false` in `supabase/config.toml` for easier development access.
