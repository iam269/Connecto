-- Add last_seen_at column to profiles table for online status tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on last_seen_at
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON public.profiles(last_seen_at);

-- Update RLS to allow reading last_seen_at
-- (Already covered by existing "Profiles are viewable by everyone" policy)
