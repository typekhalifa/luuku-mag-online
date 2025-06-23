
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleContent from "@/components/article/ArticleContent";
import ArticleFooter from "@/components/article/ArticleFooter";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import ArticleSkeleton from "@/components/article/ArticleSkeleton";
import { toast } from "@/components/ui/use-toast";

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
  views: number;
  our_pick?: boolean | null;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleWithViews | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError("No article ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching article with ID:", id);
        
        // First check if the article exists
        const { data, error: fetchError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .maybeSingle(); // Use maybeSingle to avoid errors when no data found

        if (fetchError) {
          console.error("Error fetching article:", fetchError);
          setError(`Database error: ${fetchError.message}`);
          toast({
            title: "Error",
            description: "Failed to load article",
            variant: "destructive",
          });
          return;
        }

        if (!data) {
          console.error("Article not found with ID:", id);
          setError("Article not found");
          return;
        }

        console.log("Article found:", data);
        const articleData = data as ArticleWithViews;
        setArticle(articleData);
        
        const currentViews = articleData.views || 0;
        setViewCount(currentViews + 1);
        
        // Update view count
        const { error: updateError } = await supabase
          .from("articles")
          .update({ views: currentViews + 1 })
          .eq("id", id);
          
        if (updateError) {
          console.error("Error updating views:", updateError);
        }
        
        // Fetch related articles
        const { data: related, error: relatedError } = await supabase
          .from("articles")
          .select("id, title, image_url, excerpt, category, published_at, views")
          .eq("category", articleData.category)
          .neq("id", id)
          .order("published_at", { ascending: false })
          .limit(4);
          
        if (!relatedError && related) {
          setRelatedArticles(related);
        }
        
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading the article",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
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

  if (error || !article) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="mt-2 text-muted-foreground mb-4">
              {error || "The article you're looking for doesn't exist or has been removed."}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Article ID: {id}
            </div>
            <Link 
              to="/articles" 
              className="inline-block bg-highlight text-white px-6 py-2 rounded hover:bg-highlight/90 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ReadingProgress />
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <ArticleHeader
                title={article.title}
                category={article.category}
                featured={article.featured}
                publishedAt={article.published_at}
                viewCount={viewCount}
                content={article.content}
                excerpt={article.excerpt}
                imageUrl={article.image_url}
              />
              
              {article.content && (
                <ArticleContent content={article.content} />
              )}

              <ArticleFooter 
                articleId={article.id} 
                author={article.author} 
              />
            </Card>
          </div>
          
          <ArticleSidebar
            currentCategory={article.category}
            currentArticleId={article.id}
            relatedArticles={relatedArticles}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ArticleDetail;
