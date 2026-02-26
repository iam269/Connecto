
-- Story highlights collections
CREATE TABLE public.story_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights viewable by everyone" ON public.story_highlights FOR SELECT USING (true);
CREATE POLICY "Users can create own highlights" ON public.story_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own highlights" ON public.story_highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own highlights" ON public.story_highlights FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_story_highlights_updated_at
  BEFORE UPDATE ON public.story_highlights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Story highlight items
CREATE TABLE public.story_highlight_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL REFERENCES public.story_highlights(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_highlight_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlight items viewable by everyone" ON public.story_highlight_items FOR SELECT USING (true);
CREATE POLICY "Users can add to own highlights" ON public.story_highlight_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.story_highlights WHERE id = highlight_id AND user_id = auth.uid()));
CREATE POLICY "Users can remove from own highlights" ON public.story_highlight_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.story_highlights WHERE id = highlight_id AND user_id = auth.uid()));

-- Post views tracking
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post views viewable by everyone" ON public.post_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can record views" ON public.post_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add video support to posts
ALTER TABLE public.posts ADD COLUMN video_url TEXT;
ALTER TABLE public.posts ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image';
