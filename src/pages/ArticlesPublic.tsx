import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
  our_pick: boolean | null;
  featured: boolean | null;
  views: number | null;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ArticlesPublic() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const navigate = useNavigate();

  const filteredCategory = query.get("category");

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const { data } = await supabase
          .from('breaking_news')
          .select('*')
          .eq('active', true)
          .order('priority', { ascending: true });
        
        setBreakingNews(data || []);
      } catch (error) {
        console.error("Error fetching breaking news:", error);
      }
    };

    const fetchArticles = async () => {
      try {
        let supabaseQuery = supabase
          .from("articles")
          .select("id, title, excerpt, image_url, category, published_at, our_pick, featured, views")
          .lte('published_at', new Date().toISOString())
          .order("published_at", { ascending: false });

        if (filteredCategory) {
          supabaseQuery = supabaseQuery.ilike(
            "category",
            filteredCategory
          );
        }

        const { data, error } = await supabaseQuery;
        if (error) throw error;
        if (data) setArticles(data as Article[]);
        
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        toast({
          title: "Error fetching articles",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
    fetchArticles();
  }, [filteredCategory]);

  // Format breaking news items with relative time
  const formattedBreakingNews = breakingNews.map(item => {
    let formattedDate = '';
    
    if (item.date) {
      try {
        // Check if the date is already in a relative format (contains "ago")
        if (typeof item.date === 'string' && item.date.includes("ago")) {
          formattedDate = item.date;
        } else {
          // Parse the date and format it as relative time
          const date = new Date(item.date);
          if (!isNaN(date.getTime())) {
            formattedDate = formatDistanceToNow(date, { addSuffix: true });
          } else {
            formattedDate = item.date;
          }
        }
      } catch (e) {
        console.error("Error formatting date:", e);
        formattedDate = item.date || "";
      }
    }
    
    return {
      text: item.text,
      link: item.link || "#",
      date: formattedDate
    };
  });

  // Use real breaking news, fallback to static if none available
  const displayedBreakingNews = formattedBreakingNews.length > 0 ? 
    formattedBreakingNews : 
    [
      { text: "Global summit on climate change concludes with new agreements", link: "#", date: "1 hour ago" },
      { text: "Tech giant announces breakthrough in quantum computing", link: "#", date: "3 hours ago" },
      { text: "Major economic policy shift announced by central bank", link: "#", date: "5 hours ago" },
    ];

  const featuredArticles = articles
    .filter(article => article.featured)
    .slice(0, 3)
    .map((article, index) => ({
      id: article.id,
      title: article.title,
      image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
      category: article.category,
      link: `/articles/${article.id}`
    }));

  // If no featured articles, use the most recent ones
  const carouselItems = featuredArticles.length > 0 ? 
    featuredArticles : 
    articles.slice(0, 3).map(article => ({
      id: article.id,
      title: article.title,
      image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
      category: article.category,
      link: `/articles/${article.id}`
    }));

  const transformArticle = (article: Article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || "",
    image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
    category: article.category,
    date: formatDistanceToNow(new Date(article.published_at), { addSuffix: true }),
    link: `/articles/${article.id}`,
    views: article.views || 0 // Include views in the transformed article
  });

  // Get articles by category
  const worldArticles = articles.filter(a => a.category?.toLowerCase() === 'world').map(transformArticle);
  const politicsArticles = articles.filter(a => a.category?.toLowerCase() === 'politics').map(transformArticle);
  const businessArticles = articles.filter(a => ['business', 'finance'].includes(a.category?.toLowerCase())).map(transformArticle);
  const sportArticles = articles.filter(a => a.category?.toLowerCase() === 'sport').map(transformArticle);
  const technologyArticles = articles.filter(a => a.category?.toLowerCase() === 'technology').map(transformArticle);
  const opportunitiesArticles = articles.filter(a => a.category?.toLowerCase() === 'opportunities').map(transformArticle);
  const youthArticles = articles.filter(a => a.category?.toLowerCase() === 'youth').map(transformArticle);
  const healthArticles = articles.filter(a => a.category?.toLowerCase() === 'health').map(transformArticle);
  const latestArticles = articles.slice(0, 6).map(transformArticle);

  // Get "Our Picks" articles from tagged articles, fallback to recent articles
  const ourPicksArticles = articles
    .filter(a => a.our_pick === true)
    .map(transformArticle);

  return (
    <Layout>
      <NewsTicker items={displayedBreakingNews} />

      {carouselItems.length > 0 && (
        <NewsCarousel items={carouselItems} />
      )}

      {filteredCategory ? (
        <>
        <div className="container pt-8">
          <button
            className="mb-4 text-highlight font-semibold underline"
            onClick={() => navigate("/articles")}
          >
            &larr; All Articles
          </button>
        </div>
        <NewsSection
          key={filteredCategory}
          title={filteredCategory.charAt(0).toUpperCase() + filteredCategory.slice(1)}
          articles={articles.map(transformArticle)}
          layout="grid"
        />
        </>
      ) : (
      loading ? (
        <div className="container py-20 text-center">
          <div className="text-2xl">Loading articles...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="container py-20 text-center">
          <div className="text-2xl">No articles found.</div>
        </div>
      ) : (
        <>
          <NewsSection 
            title="Latest Articles" 
            articles={latestArticles}
            layout="grid"
          />

          {ourPicksArticles.length > 0 && (
            <NewsSection 
              title="Our Picks" 
              articles={ourPicksArticles}
              layout="featured"
              className="bg-gray-50"
            />
          )}

          {worldArticles.length > 0 && (
            <NewsSection 
              title="World" 
              articles={worldArticles}
              layout="list"
            />
          )}

          {politicsArticles.length > 0 && (
            <NewsSection 
              title="Politics" 
              articles={politicsArticles}
              layout="grid"
              className="bg-gray-50"
            />
          )}

          {sportArticles.length > 0 && (
            <NewsSection 
              title="Sport" 
              articles={sportArticles}
              layout="featured"
            />
          )}

          {businessArticles.length > 0 && (
            <NewsSection 
              title="Business & Finance" 
              articles={businessArticles}
              layout="list"
              className="bg-gray-50"
            />
          )}

          {technologyArticles.length > 0 && (
            <NewsSection 
              title="Technology" 
              articles={technologyArticles}
              layout="grid"
            />
          )}

          {youthArticles.length > 0 && (
            <NewsSection
              title="Youth"
              articles={youthArticles}
              layout="grid"
            />
          )}

          {healthArticles.length > 0 && (
            <NewsSection
              title="Health"
              articles={healthArticles}
              layout="grid"
            />
          )}

          {opportunitiesArticles.length > 0 && (
            <NewsSection
              title="Opportunities"
              articles={opportunitiesArticles}
              layout="featured"
            />
          )}

        </>
      )
      )}
    </Layout>
  );
}
