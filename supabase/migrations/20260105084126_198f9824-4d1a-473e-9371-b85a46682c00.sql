-- Create table for storing user stock theories
CREATE TABLE public.user_stock_theories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  theory TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 65,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_explored JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking user XP and progress
CREATE TABLE public.user_research_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  research_time_minutes INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_stock_theories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_research_xp ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stock_theories
CREATE POLICY "Users can view their own theories" 
ON public.user_stock_theories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own theories" 
ON public.user_stock_theories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own theories" 
ON public.user_stock_theories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own theories" 
ON public.user_stock_theories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for user_research_xp
CREATE POLICY "Users can view their own XP" 
ON public.user_research_xp 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own XP record" 
ON public.user_research_xp 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP" 
ON public.user_research_xp 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stock_theories_updated_at
BEFORE UPDATE ON public.user_stock_theories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_research_xp_updated_at
BEFORE UPDATE ON public.user_research_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();