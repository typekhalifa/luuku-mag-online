
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { EyeIcon } from 'lucide-react';
import CategoryFollow from '@/components/CategoryFollow';
import TrendingArticles from '@/components/TrendingArticles';
import RecommendedArticles from '@/components/RecommendedArticles';

interface RelatedArticle {
  id: string;
  title: string;
  category: string;
  views?: number;
  published_at: string;
  image_url?: string | null;
}

interface ArticleSidebarProps {
  currentCategory: string;
  currentArticleId: string;
  relatedArticles: RelatedArticle[];
}

const ArticleSidebar = ({ currentCategory, currentArticleId, relatedArticles }: ArticleSidebarProps) => {
  const formatArticleDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        {/* Category Follow */}
        <CategoryFollow currentCategory={currentCategory} />
        
        {/* Trending Articles */}
        <TrendingArticles />
        
        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Related Articles</h2>
            <div className="space-y-4">
              {relatedArticles.map((related) => (
                <Link to={`/articles/${related.id}`} key={related.id}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    {related.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={related.image_url}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <Badge className="mb-2">{related.category}</Badge>
                      <h3 className="font-medium line-clamp-2">{related.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatArticleDate(related.published_at)}
                        </p>
                        {related.views !== undefined && (
                          <p className="text-xs flex items-center text-muted-foreground">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            {related.views}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommended Articles */}
        <RecommendedArticles 
          currentArticleId={currentArticleId} 
          currentCategory={currentCategory} 
        />
      </div>
    </div>
  );
};

export default ArticleSidebar;
