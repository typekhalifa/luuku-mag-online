
-- Add views column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
