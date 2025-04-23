
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

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

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">Latest Articles</h1>
        {loading ? (
          <div>Loading...</div>
        ) : articles.length === 0 ? (
          <div>No articles found.</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                to={`/articles/${article.id}`}
                key={article.id}
                className="group block rounded-lg border shadow-sm hover:shadow-lg transition bg-white dark:bg-gray-900"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <span className="inline-block mb-2 px-2 py-1 text-xs rounded bg-highlight text-white">
                    {article.category}
                  </span>
                  <h2 className="text-xl font-semibold group-hover:text-highlight">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(article.published_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
