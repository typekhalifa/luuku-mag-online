
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { StarIcon, EyeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendedArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  published_at: string;
  image_url: string | null;
  excerpt: string | null;
}

interface RecommendedArticlesProps {
  currentArticleId?: string;
  currentCategory?: string;
}

const RecommendedArticles = ({ currentArticleId, currentCategory }: RecommendedArticlesProps) => {
  const [articles, setArticles] = useState<RecommendedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedArticles = async () => {
      try {
        let query = supabase
          .from('articles')
          .select('id, title, category, views, published_at, image_url, excerpt')
          .order('published_at', { ascending: false })
          .limit(6);

        // If we have a current article, exclude it
        if (currentArticleId) {
          query = query.neq('id', currentArticleId);
        }

        // Prioritize articles from the same category
        if (currentCategory) {
          const { data: categoryArticles } = await query
            .eq('category', currentCategory)
            .limit(3);
          
          const { data: otherArticles } = await supabase
            .from('articles')
            .select('id, title, category, views, published_at, image_url, excerpt')
            .neq('category', currentCategory)
            .neq('id', currentArticleId || '')
            .order('views', { ascending: false })
            .limit(3);

          const combined = [
            ...(categoryArticles || []),
            ...(otherArticles || [])
          ].slice(0, 4);
          
          setArticles(combined);
        } else {
          const { data, error } = await query;
          if (error) throw error;
          setArticles(data || []);
        }
      } catch (error) {
        console.error('Error fetching recommended articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedArticles();
  }, [currentArticleId, currentCategory]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <StarIcon className="h-5 w-5 text-highlight" />
          <h3 className="text-lg font-bold">Recommended for You</h3>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StarIcon className="h-5 w-5 text-highlight" />
        <h3 className="text-lg font-bold">Recommended for You</h3>
      </div>
      {articles.map((article) => (
        <Link key={article.id} to={`/articles/${article.id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            {article.image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <Badge className="mb-2 text-xs">{article.category}</Badge>
              <h4 className="font-medium text-sm line-clamp-2 mb-2">{article.title}</h4>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                <div className="flex items-center gap-1">
                  <EyeIcon className="h-3 w-3" />
                  {article.views || 0}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default RecommendedArticles;
