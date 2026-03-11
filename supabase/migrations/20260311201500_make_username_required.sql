-- Make username required in profiles table
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles((lower(username)));

-- Update the trigger to handle duplicate profile creation (Edge Function also creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(LOWER(NEW.raw_user_meta_data->>'username'), 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
