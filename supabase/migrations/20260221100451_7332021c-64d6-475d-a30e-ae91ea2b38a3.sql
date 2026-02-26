
-- Storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies for media bucket
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  duration_hours INTEGER NOT NULL DEFAULT 24,
  audience TEXT NOT NULL DEFAULT 'everyone',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all active promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Users can create own promotions" ON public.promotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own promotions" ON public.promotions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own promotions" ON public.promotions FOR DELETE USING (auth.uid() = user_id);

-- Add profile fields for location, website, cover image
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
