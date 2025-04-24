import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ArticlesPublic() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const navigate = useNavigate();

  const filteredCategory = query.get("category");

  useEffect(() => {
    const fetchArticles = async () => {
      let supabaseQuery = supabase
        .from("articles")
        .select("id, title, excerpt, image_url, category, published_at")
        .order("published_at", { ascending: false });

      if (filteredCategory) {
        supabaseQuery = supabaseQuery.ilike(
          "category",
          filteredCategory
        );
      }

      const { data, error } = await supabaseQuery;
      if (!error && data) setArticles(data as Article[]);
      setLoading(false);
    };
    fetchArticles();
  }, [filteredCategory]);

  const breakingNews = [
    { text: "Global summit on climate change concludes with new agreements", link: "#", date: "1h ago" },
    { text: "Tech giant announces breakthrough in quantum computing", link: "#", date: "3h ago" },
    { text: "Major economic policy shift announced by central bank", link: "#", date: "5h ago" },
    { text: "International space mission discovers signs of water on distant planet", link: "#", date: "Today" },
    { text: "Sports league announces expansion to new cities", link: "#", date: "Today" },
  ];

  const featuredArticles = articles.slice(0, 3).map((article, index) => ({
    id: parseInt(article.id),
    title: article.title,
    image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
    category: article.category,
    link: `/articles/${article.id}`
  }));

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

  const transformArticle = (article: Article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || "",
    image: article.image_url || "https://placehold.co/600x400/e08b6c/white?text=LUUKU+MAG",
    category: article.category,
    date: new Date(article.published_at).toLocaleDateString(),
    link: `/articles/${article.id}`
  });

  const worldArticles = articles.filter(a => a.category?.toLowerCase() === 'world').map(transformArticle);
  const politicsArticles = articles.filter(a => a.category?.toLowerCase() === 'politics').map(transformArticle);
  const businessArticles = articles.filter(a => ['business', 'finance'].includes(a.category?.toLowerCase())).map(transformArticle);
  const sportArticles = articles.filter(a => a.category?.toLowerCase() === 'sport').map(transformArticle);
  const technologyArticles = articles.filter(a => a.category?.toLowerCase() === 'technology').map(transformArticle);
  const opportunitiesArticles = articles.filter(a => a.category?.toLowerCase() === 'opportunities').map(transformArticle);
  const youthArticles = articles.filter(a => a.category?.toLowerCase() === 'youth').map(transformArticle);
  const cultureArticles = articles.filter(a => a.category?.toLowerCase() === 'culture').map(transformArticle);
  const latestArticles = articles.slice(0, 6).map(transformArticle);

  function getFirstOfEach(categories: string[]) {
    const picks: any[] = [];
    categories.forEach(category => {
      const found = articles.find(a => a.category && a.category.toLowerCase() === category);
      if (found) picks.push(transformArticle(found));
    });
    return picks;
  }

  const ourPicksCategories = ["technology", "world", "opportunities", "sport"];
  const ourPicksArticles = getFirstOfEach(ourPicksCategories);

  return (
    <Layout>
      <NewsTicker items={breakingNews} />

      <NewsCarousel 
        items={featuredArticles.length > 0 ? featuredArticles : defaultCarouselItems} 
      />

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

          {cultureArticles.length > 0 && (
            <NewsSection
              title="Culture"
              articles={cultureArticles}
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
