
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import NewsTicker from "@/components/sections/NewsTicker";
import NewsCarousel from "@/components/sections/NewsCarousel";
import NewsSection from "@/components/sections/NewsSection";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
};

export default function ArticlesPublic() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, title, excerpt, image_url, category, published_at"
        )
        .order("published_at", { ascending: false });
      if (!error && data) setArticles(data as Article[]);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  // Mock data for news ticker
  const breakingNews = [
    { text: "Global summit on climate change concludes with new agreements", link: "#", date: "1h ago" },
    { text: "Tech giant announces breakthrough in quantum computing", link: "#", date: "3h ago" },
    { text: "Major economic policy shift announced by central bank", link: "#", date: "5h ago" },
    { text: "International space mission discovers signs of water on distant planet", link: "#", date: "Today" },
    { text: "Sports league announces expansion to new cities", link: "#", date: "Today" },
  ];

  // Mock data for carousel
  const featuredArticles = articles.slice(0, 3).map((article, index) => ({
    id: parseInt(article.id),
    title: article.title,
    image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
    category: article.category,
    link: `/articles/${article.id}`
  }));

  // Default carousel items if no articles available
  const defaultCarouselItems = [
    {
      id: 1,
      title: "The Future of Sustainable Energy: New Breakthroughs",
      image: "https://placehold.co/1200x800/e08b6c/white?text=Energy",
      category: "Technology",
      link: "#"
    },
    {
      id: 2,
      title: "Global Economic Outlook: Experts Predict Growth",
      image: "https://placehold.co/1200x800/e08b6c/white?text=Economics",
      category: "Finance",
      link: "#"
    },
    {
      id: 3,
      title: "The Changing Landscape of International Politics",
      image: "https://placehold.co/1200x800/e08b6c/white?text=Politics",
      category: "World",
      link: "#"
    }
  ];

  // Group articles by category
  const worldArticles = articles.filter(a => a.category?.toLowerCase() === 'world').map(transformArticle);
  const politicsArticles = articles.filter(a => a.category?.toLowerCase() === 'politics').map(transformArticle);
  const businessArticles = articles.filter(a => a.category?.toLowerCase() === 'business' || a.category?.toLowerCase() === 'finance').map(transformArticle);
  const sportArticles = articles.filter(a => a.category?.toLowerCase() === 'sport').map(transformArticle);
  const technologyArticles = articles.filter(a => a.category?.toLowerCase() === 'technology').map(transformArticle);
  const latestArticles = articles.slice(0, 6).map(transformArticle);
  const ourPicksArticles = [1, 4, 5].map(i => articles[i]).filter(Boolean).map(transformArticle);
  
  // Transform article to NewsArticle format
  function transformArticle(article: Article) {
    return {
      id: parseInt(article.id),
      title: article.title,
      excerpt: article.excerpt || "",
      image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
      category: article.category,
      date: new Date(article.published_at).toLocaleDateString(),
      link: `/articles/${article.id}`
    };
  }

  return (
    <Layout>
      {/* Breaking News Ticker */}
      <NewsTicker items={breakingNews} />
      
      {/* Featured Carousel */}
      <NewsCarousel 
        items={featuredArticles.length > 0 ? featuredArticles : defaultCarouselItems} 
      />

      {loading ? (
        <div className="container py-20 text-center">
          <div className="text-2xl">Loading articles...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="container py-20 text-center">
          <div className="text-2xl">No articles found.</div>
        </div>
      ) : (
        <>
          {/* Latest Articles */}
          <NewsSection 
            title="Latest Articles" 
            articles={latestArticles}
            layout="grid"
          />
          
          {/* Our Picks */}
          {ourPicksArticles.length > 0 && (
            <NewsSection 
              title="Our Picks" 
              articles={ourPicksArticles}
              layout="featured"
              className="bg-gray-50"
            />
          )}
          
          {/* World News */}
          {worldArticles.length > 0 && (
            <NewsSection 
              title="World" 
              articles={worldArticles}
              layout="list"
            />
          )}

          {/* Politics */}
          {politicsArticles.length > 0 && (
            <NewsSection 
              title="Politics" 
              articles={politicsArticles}
              layout="grid"
              className="bg-gray-50"
            />
          )}

          {/* Sports */}
          {sportArticles.length > 0 && (
            <NewsSection 
              title="Sport" 
              articles={sportArticles}
              layout="featured"
            />
          )}

          {/* Business */}
          {businessArticles.length > 0 && (
            <NewsSection 
              title="Business & Finance" 
              articles={businessArticles}
              layout="list"
              className="bg-gray-50"
            />
          )}

          {/* Technology */}
          {technologyArticles.length > 0 && (
            <NewsSection 
              title="Technology" 
              articles={technologyArticles}
              layout="grid"
            />
          )}
        </>
      )}
    </Layout>
  );
}
