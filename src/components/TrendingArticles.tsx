
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUpIcon, EyeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  published_at: string;
  image_url: string | null;
}

const TrendingArticles = () => {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, category, views, published_at, image_url')
          .lte('published_at', new Date().toISOString())
          .order('views', { ascending: false })
          .limit(5);

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching trending articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingArticles();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUpIcon className="h-5 w-5 text-highlight" />
          <h3 className="text-lg font-bold">Trending Articles</h3>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUpIcon className="h-5 w-5 text-highlight" />
        <h3 className="text-lg font-bold">Trending Articles</h3>
      </div>
      {articles.map((article, index) => (
        <Link key={article.id} to={`/articles/${article.id}`}>
          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-200">
                  {article.image_url ? (
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      #{index + 1}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    {article.views || 0}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default TrendingArticles;
