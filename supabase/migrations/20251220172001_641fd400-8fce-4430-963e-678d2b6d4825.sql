-- Market Regime table for caching market weather data
CREATE TABLE public.market_regime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regime_type text NOT NULL, -- 'risk-on', 'risk-off', 'sideways', 'momentum'
  headline text NOT NULL,
  summary text NOT NULL,
  indicators jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS with public read access
ALTER TABLE public.market_regime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market regime is publicly readable" 
ON public.market_regime 
FOR SELECT 
USING (true);

-- Macro events table for Fed meetings, CPI, jobs reports
CREATE TABLE public.macro_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'fed_meeting', 'cpi', 'jobs_report', 'gdp'
  event_name text NOT NULL,
  event_date date NOT NULL,
  description text,
  importance text DEFAULT 'medium' -- 'low', 'medium', 'high'
);

-- Enable RLS with public read access
ALTER TABLE public.macro_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Macro events are publicly readable" 
ON public.macro_events 
FOR SELECT 
USING (true);