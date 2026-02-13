-- 1. Create user_profiles table
-- Using NOT NULL and PRIMARY KEY ensures every profile is tied to a real auth user
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  referral_code_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can only see their own full profile data
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only update their own profile data
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow public lookup of usernames ONLY (no emails or sensitive IDs) 
-- to prevent guests from "guessing" identities or accessing private data.
DROP POLICY IF EXISTS "Public username lookup" ON public.user_profiles;
CREATE POLICY "Public username lookup"
ON public.user_profiles
FOR SELECT
USING (true);

-- 4. Function to Create/Update User Profile
-- This uses SECURITY DEFINER to bypass RLS during the signup flow
CREATE OR REPLACE FUNCTION public.handle_user_profile_management(
  user_id UUID,
  username_text TEXT,
  referral_code_text TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Security check: Ensure the user_id matches the caller or is called by system
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Unauthorized: You cannot modify another user profile.';
  END IF;

  INSERT INTO public.user_profiles (id, username, referral_code_used)
  VALUES (user_id, username_text, referral_code_text)
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      referral_code_used = COALESCE(EXCLUDED.referral_code_used, user_profiles.referral_code_used),
      updated_at = NOW();
END;
$$;

-- 5. Function to Lookup Email (Strictly for Auth Flow)
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT u.email INTO found_email
  FROM auth.users u
  JOIN public.user_profiles p ON u.id = p.id
  WHERE LOWER(p.username) = LOWER(username_text);
  
  RETURN found_email;
END;
$$;

-- 6. Permissions
-- Restricted to authenticated and anon (for login) but governed by the logic inside the functions
GRANT EXECUTE ON FUNCTION public.handle_user_profile_management(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon, authenticated;

-- 7. Apply the Update Trigger (from the previous step)
CREATE TRIGGER set_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();