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
import { Helmet } from "react-helmet";

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
        
        let articleQuery;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(id)) {
          articleQuery = supabase
            .from("articles")
            .select("*")
            .eq("id", id);
        } else {
          articleQuery = supabase
            .from("articles")
            .select("*")
            .eq("slug", id);
        }

        const { data, error: fetchError } = await articleQuery.maybeSingle();

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
          console.error("Article not found with ID/slug:", id);
          setError("Article not found");
          return;
        }

        console.log("Article found:", data);
        const articleData = data as ArticleWithViews;
        setArticle(articleData);
        
        const currentViews = articleData.views || 0;
        setViewCount(currentViews + 1);
        
        // Use RPC function to increment views (bypasses RLS)
        const { error: updateError } = await supabase
          .rpc("increment_article_views", { article_id: articleData.id });
          
        if (updateError) {
          console.error("Error updating views:", updateError);
        }
        
        const { data: related, error: relatedError } = await supabase
          .from("articles")
          .select("id, title, image_url, excerpt, category, published_at, views")
          .eq("category", articleData.category)
          .neq("id", articleData.id)
          .lte('published_at', new Date().toISOString())
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

  // FIXED: Correct URL path to match your routing
  const articleUrl = `https://luukumag.com/articles/${article.slug || article.id}`;
  
  // Use article image if available, otherwise fallback to logo
  const articleImage = article.image_url || 'https://luukumag.com/lovable-uploads/logo.png';
  
  // Create a clean excerpt (remove HTML tags if any)
  const cleanExcerpt = article.excerpt 
    ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 160)
    : article.title;

  return (
    <Layout>
      <Helmet>
        <title>{article.title} - LUUKU MAG</title>
        <meta name="description" content={cleanExcerpt} />
        <link rel="canonical" href={articleUrl} />
        
        {/* Essential OpenGraph tags for Facebook */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={cleanExcerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={articleImage} />
        <meta property="og:image:secure_url" content={articleImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.title} />
        <meta property="og:site_name" content="LUUKU MAG" />
        <meta property="og:locale" content="en_US" />
        
        {/* Article specific metadata */}
        <meta property="article:published_time" content={article.published_at} />
        <meta property="article:modified_time" content={article.updated_at} />
        <meta property="article:section" content={article.category} />
        <meta property="article:author" content={article.author || "LUUKU MAG Editorial Team"} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@luukumag" />
        <meta name="twitter:creator" content="@luukumag" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={cleanExcerpt} />
        <meta name="twitter:image" content={articleImage} />
        <meta name="twitter:image:alt" content={article.title} />
      </Helmet>
      
      <ReadingProgress />
      
      {/* Breadcrumb Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://luukumag.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": article.category,
              "item": `https://luukumag.com/articles?category=${encodeURIComponent(article.category)}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title,
              "item": articleUrl
            }
          ]
        })}
      </script>

      {/* Article Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": cleanExcerpt,
          "image": {
            "@type": "ImageObject",
            "url": articleImage,
            "width": 1200,
            "height": 630
          },
          "datePublished": article.published_at,
          "dateModified": article.updated_at,
          "author": {
            "@type": "Person",
            "name": article.author || "LUUKU MAG Editorial Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "LUUKU MAG",
            "logo": {
              "@type": "ImageObject",
              "url": "https://luukumag.com/lovable-uploads/logo.png",
              "width": 200,
              "height": 60
            }
          },
          "articleSection": article.category,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
          }
        })}
      </script>

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
