
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

      const articleData = data as ArticleWithViews;
      setArticle(articleData);
      
      const currentViews = articleData.views || 0;
      setViewCount(currentViews + 1);
      
      await supabase
        .from("articles")
        .update({ views: currentViews + 1 })
        .eq("id", id);
      
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
