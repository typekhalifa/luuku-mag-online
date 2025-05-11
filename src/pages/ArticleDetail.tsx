
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon, BadgeIcon, EyeIcon } from "lucide-react";

// Define an interface that extends the database type but includes the views property
interface ArticleWithViews {
  author: string | null;
  category: string;
  content: string | null;
  excerpt: string | null;
  featured: boolean | null;
  id: string;
  image_url: string | null;
  published_at: string;
  slug: string | null;
  title: string;
  updated_at: string;
  views?: number; // Make views optional since it's newly added
}

// Create a type for the update payload that includes views
interface ArticleUpdatePayload {
  views: number;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleWithViews | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        return;
      }

      // Cast data to our extended interface
      const articleData = data as ArticleWithViews;
      setArticle(articleData);
      
      // Safely get view count, defaulting to 0 if undefined
      const currentViews = articleData.views || 0;
      setViewCount(currentViews + 1);
      
      // Update view count in database
      // Use type assertion to tell TypeScript that this update payload is valid
      await supabase
        .from("articles")
        .update({ views: currentViews + 1 } as unknown as ArticleUpdatePayload)
        .eq("id", id);
      
      // Fetch related articles in the same category
      const { data: related, error: relatedError } = await supabase
        .from("articles")
        .select("id, title, image_url, excerpt, category, published_at")
        .eq("category", articleData.category)
        .neq("id", id)
        .order("published_at", { ascending: false })
        .limit(4);
        
      if (!relatedError && related) {
        setRelatedArticles(related);
      }
      
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  // Function to format content with proper paragraphs
  const formatContent = (content: string) => {
    if (!content) return [];
    
    // Split by double line breaks for paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    // Handle single line breaks within paragraphs
    return paragraphs.map(paragraph => {
      // Replace single line breaks with <br> tags
      return paragraph.split(/\n/).join("<br />");
    });
  };

  // Format date for display
  const formatArticleDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <ArticleSkeleton />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Article not found</h2>
            <p className="mt-2 text-muted-foreground">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/articles" className="mt-4 inline-block text-highlight hover:underline">
              Browse all articles
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse dates safely
  const publishDate = new Date(article.published_at);
  const isValidPublishDate = !isNaN(publishDate.getTime());
  
  const formattedDate = isValidPublishDate 
    ? format(publishDate, "MMMM d, yyyy 'at' h:mm a")
    : "Invalid date";
    
  const relativeDate = isValidPublishDate
    ? formatDistanceToNow(publishDate, { addSuffix: true })
    : "Unknown time ago";

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              {article.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <Badge className="bg-highlight text-white">
                      {article.category}
                    </Badge>
                    {article.featured && (
                      <Badge variant="success" className="flex gap-1 items-center">
                        <BadgeIcon className="h-3 w-3" />
                        <span>Featured</span>
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold mt-2">{article.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Published {formattedDate}</span>
                    </div>
                    <span className="mx-1">•</span>
                    <span>{relativeDate}</span>
                    <span className="mx-1">•</span>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{viewCount} views</span>
                    </div>
                  </div>
                </div>
                
                {article.excerpt && (
                  <p className="text-lg font-medium text-gray-600 mb-6 border-l-4 border-highlight pl-4 italic">
                    {article.excerpt}
                  </p>
                )}
                
                <div className="prose max-w-none space-y-6">
                  {formatContent(article.content || "").map((paragraph, i) => (
                    <div 
                      key={i} 
                      className="text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      {article.author && <span>Written by <strong>{article.author}</strong></span>}
                    </div>
                    <LikeButton articleId={article.id} />
                  </div>
                  <div className="mt-6">
                    <CommentSection articleId={article.id} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4">Related Articles</h2>
              <div className="space-y-4">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((related) => (
                    <Link to={`/articles/${related.id}`} key={related.id}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        {related.image_url && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={related.image_url}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <Badge className="mb-2">{related.category}</Badge>
                          <h3 className="font-medium line-clamp-2">{related.title}</h3>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatArticleDate(related.published_at)}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No related articles found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ArticleSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-6 space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="space-y-2 pt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </Card>
);

export default ArticleDetail;
