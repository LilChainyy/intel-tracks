# Switching to adamsmyth Supabase Project

## Step 1: Find Your Project ID

1. Go to: https://supabase.com/dashboard/project/adamsmyth
2. Click on **Settings** → **General**
3. Look for **Reference ID** - this is your project ID (looks like: `abcdefghijklmnop`)
4. Copy it

OR

The project URL will be: `https://YOUR_PROJECT_ID.supabase.co`
- You can find this in Settings → API → Project URL

## Step 2: Update Config

Once you have the project ID, we'll update `supabase/config.toml`

## Step 3: Run All Migrations

You'll need to run all existing migrations on the new project:
- All files in `supabase/migrations/` folder
- This includes the new `catalysts` table migration

## Step 4: Deploy Edge Functions

All Edge Functions need to be deployed to the new project:
- fetch-stock-data
- refresh-stock-data
- stock-chart
- stock-analysis
- ai-advisor-chat
- company-advisor-chat
- analyze-learning
- fetch-catalysts (new)

## Step 5: Update Environment Variables

Your frontend needs the new project's URL and keys:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

These are usually in:
- `.env` file (if exists)
- Or set in your deployment platform (Vercel, Netlify, etc.)
