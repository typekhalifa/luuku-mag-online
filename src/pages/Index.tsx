
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";
import InstagramGrid from "@/components/sections/InstagramGrid";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both breaking news and articles in parallel
        const [breakingNewsResponse, articlesResponse] = await Promise.all([
          supabase
            .from('breaking_news')
            .select('*')
            .eq('active', true)
            .order('priority', { ascending: true }),
          supabase
            .from('articles')
            .select('*')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(20) // Limit initial load for better performance
        ]);

        if (breakingNewsResponse.data) {
          setBreakingNews(breakingNewsResponse.data);
        }

        if (articlesResponse.error) throw articlesResponse.error;
        
        setArticles(articlesResponse.data || []);
        
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading content",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format the breaking news items with better relative time formatting
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
        formattedDate = item.date ? (typeof item.date === 'string' ? item.date : '') : ''; 
      }
    }
    
    return {
      text: item.text,
      link: item.link,
      date: formattedDate
    };
  });

  // Don't use fallback news if we have real breaking news
  const displayedBreakingNews = loading ? [] : formattedBreakingNews;

  // Format articles for display
  const formatArticleForDisplay = (article: any) => {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || "",
      image: article.image_url || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470",
      category: article.category,
      date: formatDistanceToNow(new Date(article.published_at), { addSuffix: true }),
      link: `/articles/${article.id}`,
      views: article.views || 0 // Include views in the formatted article
    };
  };

  // Get featured articles for the carousel
  const getFeaturedArticles = () => {
    const featured = articles.filter(article => article.featured === true).slice(0, 3);
    
    if (featured.length === 0) {
      // If no featured articles, use the most recent ones
      return articles.slice(0, 3).map(article => ({
        id: article.id,
        title: article.title,
        image: article.image_url || "https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=1470",
        category: article.category,
        link: `/articles/${article.id}`
      }));
    }
    
    return featured.map(article => ({
      id: article.id,
      title: article.title,
      image: article.image_url || "https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=1470",
      category: article.category,
      link: `/articles/${article.id}`
    }));
  };

  const carouselItems = loading ? [] : getFeaturedArticles();

  // Get articles by category
  const getArticlesByCategory = (category: string) => {
    return articles
      .filter(article => article.category?.toLowerCase() === category.toLowerCase())
      .slice(0, 6) // Limit to 6 articles per section
      .map(formatArticleForDisplay);
  };

  // Get articles marked as "our pick"
  const getOurPicks = () => {
    const ourPicks = articles.filter(article => article.our_pick === true).slice(0, 6);
    
    if (ourPicks.length === 0) {
      // If no articles marked as "our pick", use the most recent ones
      return articles.slice(0, 6).map(formatArticleForDisplay);
    }
    
    return ourPicks.map(formatArticleForDisplay);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          {/* Loading skeleton */}
          <div className="mb-8">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const technologyArticles = getArticlesByCategory("Technology");
  const worldArticles = getArticlesByCategory("World");
  const opportunitiesArticles = getArticlesByCategory("Opportunities");
  const ourPicks = getOurPicks();

  return (
    <Layout>
      {/* Breaking News Ticker - Only show if we have items to display */}
      {displayedBreakingNews.length > 0 && (
        <NewsTicker 
          items={displayedBreakingNews}
          className="mb-4" 
        />
      )}
      
      <div className="container py-8">
        {/* Featured News Carousel - Directly below the ticker */}
        {carouselItems.length > 0 && (
          <NewsCarousel items={carouselItems} className="mb-8" />
        )}
        
        {/* Other News Sections */}
        {ourPicks.length > 0 && (
          <NewsSection 
            title="Our Picks" 
            articles={ourPicks} 
            layout="grid" 
          />
        )}
        
        {technologyArticles.length > 0 && (
          <NewsSection 
            title="Technology Updates" 
            articles={technologyArticles} 
            layout="grid" 
          />
        )}
        
        {worldArticles.length > 0 && (
          <NewsSection 
            title="World News" 
            articles={worldArticles} 
            layout="featured" 
          />
        )}
        
        {opportunitiesArticles.length > 0 && (
          <NewsSection 
            title="Latest Opportunities" 
            articles={opportunitiesArticles} 
            layout="list" 
          />
        )}
        
        <InstagramGrid />
      </div>
    </Layout>
  );
}
