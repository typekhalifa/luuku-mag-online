
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
import { ClockIcon, BadgeIcon } from "lucide-react";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      setArticle(data);
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

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
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                <ClockIcon className="h-4 w-4" />
                <span>Published {formattedDate}</span>
                <span className="mx-1">•</span>
                <span>{relativeDate}</span>
              </div>
            </div>
            
            {article.excerpt && (
              <p className="text-lg font-medium text-gray-600 mb-6 border-l-4 border-highlight pl-4 italic">
                {article.excerpt}
              </p>
            )}
            
            <div className="prose max-w-none">
              {article.content}
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
