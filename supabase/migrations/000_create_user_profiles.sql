-- ============================================
-- USER PROFILES TABLE
-- Stores username linked to Supabase auth users
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  referral_code_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Anyone can read usernames (for login lookup)
CREATE POLICY "Anyone can read usernames"
ON public.user_profiles
FOR SELECT
USING (true);

-- Policy: Service role can insert (for signup)
-- Note: This will be handled via Edge Function or trigger

-- Create function to create/update user profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  username_text TEXT,
  referral_code_text TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, referral_code_used)
  VALUES (user_id, username_text, referral_code_text)
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      referral_code_used = EXCLUDED.referral_code_used,
      updated_at = now();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT) TO anon;

-- Create function to lookup email by username (for login)
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT u.email INTO user_email
  FROM auth.users u
  INNER JOIN public.user_profiles p ON u.id = p.id
  WHERE p.username = username_text;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO authenticated;
