-- Create a function to increment article views (bypasses RLS)
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = article_id;
END;
$$;