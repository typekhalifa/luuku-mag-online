
-- Add our_pick column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS our_pick boolean DEFAULT false;

-- Add views column to breaking_news table to track clicks on breaking news
ALTER TABLE public.breaking_news ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
