-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User activity tracking table
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL, -- 'view_stock', 'save_stock', 'view_playlist', 'external_link', 'take_quiz'
  ticker text,
  playlist_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Activity policies - users can only see/add their own
CREATE POLICY "Users can read own activity" 
ON public.user_activity FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" 
ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User nudges table
CREATE TABLE public.user_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nudge_type text NOT NULL, -- 'upcoming_event', 'overtrading_warning', 'inactivity_reminder', 'saved_stock_event'
  message text NOT NULL,
  related_ticker text,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_nudges ENABLE ROW LEVEL SECURITY;

-- Nudge policies - users can only see/modify their own
CREATE POLICY "Users can read own nudges" 
ON public.user_nudges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own nudges" 
ON public.user_nudges FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster activity queries
CREATE INDEX idx_user_activity_user_id_created ON public.user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_nudges_user_id ON public.user_nudges(user_id, is_read, is_dismissed);