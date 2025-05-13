import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";
import InstagramGrid from "@/components/sections/InstagramGrid";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export default function Index() {
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false });
          
        if (error) throw error;
        
        setArticles(data || []);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        toast({
          title: "Error fetching articles",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchBreakingNews();
    fetchArticles();
  }, []);

  // Format the breaking news items to display the date BEFORE the text
  const formattedBreakingNews = breakingNews.map(item => {
    let formattedDate = '';
    
    if (item.date) {
      try {
        // Check if the date is already in a relative format (contains "ago")
        if (typeof item.date === 'string' && item.date.includes("ago")) {
          formattedDate = item.date;
        } else {
          // Format the date as "X time ago" (e.g. "1 hour ago", "5 minutes ago")
          formattedDate = formatDistanceToNow(new Date(item.date), { addSuffix: true });
        }
      } catch (e) {
        console.error("Error formatting date:", e);
        formattedDate = item.date ? (typeof item.date === 'string' ? item.date : '') : ''; 
      }
    }
    
    return {
      text: item.text,
      link: item.link,
      date: formattedDate // This is the properly formatted date that will be displayed
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
      date: new Date(article.published_at).toLocaleDateString(),
      link: `/articles/${article.id}`
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
